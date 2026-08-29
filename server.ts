import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { LLMService } from "./server/services/llmService.js";
import { AnalysisService } from "./server/services/analysisService.js";
import { ScreeningWorker } from "./server/workers/screeningWorker.js";

dotenv.config();

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize Services
const llmService = new LLMService();
const analysisService = new AnalysisService(llmService);
const screeningWorker = new ScreeningWorker(analysisService);

// Health check
app.get(["/health", "/api/v1/health"], (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "AI Resume Matcher is running",
  });
});

// API Routes Router
const apiRouter = express.Router();

// 1. Candidate Screening Worker Endpoint
apiRouter.post("/screening/screen", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resume_text, jd_text, job_title = "Software Developer" } = req.body;
    const result = await screeningWorker.run(resume_text, jd_text, job_title);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 2. High-level Analysis Endpoint
apiRouter.post("/analysis/analyse", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resume_text = req.body.resume_text || req.body.resume;
    const jd_text = req.body.jd_text || req.body.jd;

    if (!resume_text || !jd_text) {
      return res.status(400).json({
        detail: "Both resume_text and jd_text are required.",
      });
    }

    const result = await analysisService.runAnalysis(String(resume_text), String(jd_text));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 3. Skill Matching Endpoint
apiRouter.post("/matching/match-skills", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resume_text, jd_text } = req.body;
    if (!resume_text || !jd_text) {
      return res.status(400).json({
        detail: "Both resume_text and jd_text are required.",
      });
    }
    const result = await analysisService.runSkillMatching(String(resume_text), String(jd_text));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 4. Gap Detection Endpoint
apiRouter.post("/gaps/detect-gaps", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resume_text, jd_text, matched_skills = [] } = req.body;
    if (!resume_text || !jd_text) {
      return res.status(400).json({
        detail: "Both resume_text and jd_text are required.",
      });
    }
    const result = await analysisService.runGapDetection(
      String(resume_text),
      String(jd_text),
      Array.isArray(matched_skills) ? matched_skills : []
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 5. Resume Improvements Endpoint
apiRouter.post("/improvements/suggest", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resume_text, job_title = "Software Developer", critical_gaps = [] } = req.body;
    if (!resume_text) {
      return res.status(400).json({
        detail: "resume_text is required.",
      });
    }
    const result = await analysisService.runImprovements(
      String(resume_text),
      String(job_title),
      Array.isArray(critical_gaps) ? critical_gaps : []
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 6. Interview Questions Endpoint
apiRouter.post("/interview/generate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jd_text, matched_skills = [], missing_skills = [] } = req.body;
    if (!jd_text) {
      return res.status(400).json({
        detail: "jd_text is required.",
      });
    }
    const result = await analysisService.runInterviewPrep(
      String(jd_text),
      Array.isArray(matched_skills) ? matched_skills : [],
      Array.isArray(missing_skills) ? missing_skills : []
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use("/api/v1", apiRouter);

// Serve Frontend static assets
const frontendDir = path.join(process.cwd(), "frontend");
app.use(express.static(frontendDir));

// Fallback to frontend/index.html for client-side routing
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("API Error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({
    detail: message,
    error: message,
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
