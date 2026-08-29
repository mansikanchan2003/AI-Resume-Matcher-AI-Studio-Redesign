/**
 * TALENTPULSE AI — MAIN APPLICATION CONTROLLER
 * Orchestrates multi-view navigation, benchmark profiles, file parsing,
 * backend API interactions, history persistence, and candidate evaluations.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ── DOM ELEMENTS ───────────────────────────────────────────
  const dropzone = document.getElementById("resume-dropzone");
  const fileInput = document.getElementById("resume-file-input");
  const btnSelectFile = document.getElementById("btn-select-file");
  const fileSelectedChip = document.getElementById("file-selected-chip");
  const fileNameDisplay = document.getElementById("file-name-display");
  const btnRemoveFile = document.getElementById("btn-remove-file");

  const targetRoleInput = document.getElementById("target-role-input");
  const jdTextarea = document.getElementById("jd-textarea");
  const btnClearJd = document.getElementById("btn-clear-jd");
  const analyseBtn = document.getElementById("analyse-btn");

  const sidebarNewAnalysis = document.getElementById("btn-sidebar-new-analysis");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const appSidebar = document.getElementById("app-sidebar");

  // Sample Benchmark Buttons
  const btnSampleBackend = document.getElementById("btn-load-backend-sample");
  const btnSampleFrontend = document.getElementById("btn-load-frontend-sample");
  const btnSampleMarketing = document.getElementById("btn-load-marketing-sample");

  // Action Buttons in Views
  const btnExportPdf = document.getElementById("btn-export-pdf");
  const btnViewEvalDetail = document.getElementById("btn-view-eval-detail");
  const btnScheduleInterview = document.getElementById("btn-schedule-interview");
  const btnEvalBack = document.getElementById("btn-eval-back-to-screening");
  const btnEvalMove = document.getElementById("btn-eval-move-interview");
  const btnDecisionReject = document.getElementById("btn-decision-reject");
  const btnDecisionHold = document.getElementById("btn-decision-hold");
  const btnDecisionAdvance = document.getElementById("btn-decision-advance");
  const btnExportHistoryReport = document.getElementById("btn-export-history-report");
  const historySearchInput = document.getElementById("history-search-input");
  const globalSearchInput = document.getElementById("global-search-input");

  // ── STATE ──────────────────────────────────────────────────
  let selectedFile = null;
  let simulatedResumeText = "";
  let currentCandidateInfo = {
    candidateName: "Alex Morgan",
    candidateId: "CAN-8924",
    targetRole: "Senior Backend Engineer",
    email: "alex.morgan@devcloud.io"
  };
  let latestAnalysisResult = null;

  // ── BENCHMARK DATA SAMPLES ─────────────────────────────────
  const BENCHMARKS = {
    backend: {
      role: "Senior Backend Engineer (AWS / Python)",
      candidateName: "Marcus Vance",
      candidateId: "CAN-4902",
      email: "marcus.vance@systems.io",
      resumeText: `Marcus Vance — Staff Backend Architect
Email: marcus.vance@systems.io | Location: San Francisco, CA | GitHub: github.com/marcusvance

PROFESSIONAL SUMMARY:
Accomplished Distributed Systems Engineer with 8+ years of expertise architecting high-throughput microservices using Python (FastAPI, asyncio), PostgreSQL, Redis, and AWS (ECS, Lambda, DynamoDB). Proven track record reducing API latency by 45% and scaling streaming workloads to 250k RPS.

CORE SKILLS:
Languages & Frameworks: Python, FastAPI, Django, TypeScript, Go
Cloud & DevOps: AWS (ECS, S3, RDS, CloudWatch, SQS), Docker, Kubernetes, Terraform, CI/CD
Databases & Cache: PostgreSQL, DynamoDB, Redis, Elasticsearch
Architecture: Distributed Systems, RESTful APIs, Event-Driven Architecture, Microservices

WORK EXPERIENCE:
Lead Backend Engineer | CloudScale Networks (2021 - Present)
- Engineered event-driven ingest pipeline processing 15M daily telemetry events with FastAPI and SQS, achieving 99.99% uptime.
- Optimized PostgreSQL database indexes and connection pooling, slashing p99 latency from 320ms to 48ms.
- Mentored a squad of 6 junior and mid-level engineers in concurrency best practices, unit testing with PyTest, and AWS architecture.

Senior Software Engineer | FinTech Protocol (2018 - 2021)
- Built payment reconciliation microservices using Python and AWS Lambda with automated idempotent transactions.
- Spearheaded migration of legacy monolith to containerized Docker services orchestrated via AWS ECS.

EDUCATION & CERTIFICATIONS:
B.S. in Computer Science — University of California, Berkeley
AWS Certified Solutions Architect – Professional`,
      jdText: `Senior Backend Engineer (Cloud Platform)
Location: Remote (US/Global)
Department: Platform Engineering

About the Role:
We are seeking an experienced Senior Backend Engineer to design and scale our next-generation cloud analytics platform. You will build resilient microservices handling millions of transactional events per day.

Key Responsibilities:
- Architect, build, and maintain high-performance, asynchronous REST APIs in Python using FastAPI or similar frameworks.
- Design scalable database models in PostgreSQL and DynamoDB, ensuring sub-50ms query latency.
- Own infrastructure-as-code and cloud deployments across AWS (ECS, S3, SQS, CloudWatch).
- Collaborate with frontend engineers, product managers, and security auditors to deliver reliable software.

Requirements:
- 5+ years of production experience building distributed backend systems in Python (FastAPI / Django).
- Strong proficiency with relational databases (PostgreSQL) and caching layers (Redis).
- Hands-on experience with AWS cloud infrastructure, Docker containers, and CI/CD automation pipelines.
- Excellent communication skills and a passion for code craftsmanship and automated testing.`
    },

    frontend: {
      role: "Staff Frontend Architect (React / TypeScript)",
      candidateName: "Elena Rodriguez",
      candidateId: "CAN-7128",
      email: "elena.rodriguez@ui-lab.org",
      resumeText: `Elena Rodriguez — Staff Frontend Architect
Email: elena.rodriguez@ui-lab.org | Location: New York, NY | Portfolio: elenarodriguez.dev

SUMMARY:
Frontend specialist with 7+ years building responsive, highly accessible SaaS applications with React, TypeScript, Next.js, and Tailwind CSS. Obsessed with web performance, Core Web Vitals, and modular design systems.

EXPERIENCE:
Staff UI Architect | HyperVisual Systems (2020 - Present)
- Architected enterprise React/TypeScript design system adopted across 8 distinct product suites.
- Reduced initial bundle size by 52% and achieved perfect 100 Lighthouse performance score through code-splitting and dynamic imports.
- Built interactive SVG & WebGL real-time analytical dashboards handling 60fps data streams.

Senior Frontend Developer | NovaTech Interactive (2017 - 2020)
- Developed state-of-the-art SPA applications using React, Redux Toolkit, and Tailwind CSS.
- Implemented WCAG 2.1 AA accessibility standards across customer portal.

EDUCATION:
B.S. in Software Engineering — Cornell University`,
      jdText: `Staff Frontend Architect (React / TypeScript)
We are seeking a Staff Frontend Architect to spearhead the frontend technical vision for our cloud orchestration dashboard.

Requirements:
- 6+ years of specialized experience in React, TypeScript, and modern state management.
- Deep expertise in Design Systems, micro-frontends, and Tailwind CSS.
- Proven mastery of Web Performance, Core Web Vitals, and responsive UI/UX design.`
    },

    marketing: {
      role: "Head of Growth & Product Marketing",
      candidateName: "Sarah Jenkins",
      candidateId: "CAN-3091",
      email: "sarah.jenkins@growthpartners.co",
      resumeText: `Sarah Jenkins — Head of Growth & B2B Product Marketing
Email: sarah.jenkins@growthpartners.co | San Francisco, CA

SUMMARY:
Data-driven B2B SaaS Marketing Leader with 8+ years scaling ARR from $2M to $25M through product-led growth (PLG), enterprise account-based marketing (ABM), and content syndication.

EXPERIENCE:
VP of Marketing | DataFlow Inc (2020 - Present)
- Drove 180% YoY increase in qualified pipeline through multi-touch attribution and targeted LinkedIn/Google campaigns.
- Built 10-person global marketing and content operations team.
- Launched company repositioning that expanded average deal size by 40%.`,
      jdText: `Head of Growth & Product Marketing (B2B SaaS)
We need an exceptional Marketing Leader to scale our product-led pipeline and accelerate revenue.

Requirements:
- 7+ years leading B2B SaaS growth, ABM campaigns, and brand messaging.
- Mastery of HubSpot, Google Analytics, SEO, and paid acquisition funnels.
- Proven ability to manage multi-million dollar annual ad budgets and lead high-performing teams.`
    }
  };

  // ── ROUTING & NAVIGATION ───────────────────────────────────
  function handleNavigation(viewId) {
    UI.switchView(viewId);
    if (window.innerWidth <= 768 && appSidebar) {
      appSidebar.classList.remove("open");
    }
  }

  // Sidebar link clicks
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const view = item.getAttribute("data-view");
      handleNavigation(view);
      window.location.hash = view;
    });
  });

  // Mobile menu hamburger
  if (mobileMenuToggle && appSidebar) {
    mobileMenuToggle.addEventListener("click", () => {
      appSidebar.classList.toggle("open");
    });
  }

  // "+ New Analysis" in sidebar
  if (sidebarNewAnalysis) {
    sidebarNewAnalysis.addEventListener("click", () => {
      handleNavigation("analyze");
      window.location.hash = "analyze";
    });
  }

  // Extended result tabs in Screening View
  document.querySelectorAll(".res-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabKey = btn.getAttribute("data-res-tab");

      document.querySelectorAll(".res-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".res-tab-panel").forEach(p => p.classList.add("hidden"));
      const targetPanel = document.getElementById(`panel-${tabKey}`);
      if (targetPanel) targetPanel.classList.remove("hidden");
    });
  });

  // ── FILE HANDLING & DRAG AND DROP ──────────────────────────
  function setLoadedFile(file, customText = "") {
    selectedFile = file;
    simulatedResumeText = customText;

    if (file) {
      currentCandidateInfo.isBenchmark = false;
      fileNameDisplay.textContent = file.name;
      const sizeKb = Math.round(file.size / 1024);
      document.getElementById("file-status-text").textContent = `${sizeKb} KB • Ready for cognitive screening`;
      fileSelectedChip.classList.remove("hidden");
      dropzone.classList.add("hidden");
    } else if (customText) {
      currentCandidateInfo.isBenchmark = true;
      fileNameDisplay.textContent = `${currentCandidateInfo.candidateName}_Resume.pdf`;
      document.getElementById("file-status-text").textContent = "Benchmark Profile Dossier Loaded";
      fileSelectedChip.classList.remove("hidden");
      dropzone.classList.add("hidden");
    }
    UI.hideError();
  }

  function clearSelectedFile() {
    selectedFile = null;
    simulatedResumeText = "";
    currentCandidateInfo.isBenchmark = false;
    fileSelectedChip.classList.add("hidden");
    dropzone.classList.remove("hidden");
    if (fileInput) fileInput.value = "";
  }

  if (btnRemoveFile) {
    btnRemoveFile.addEventListener("click", clearSelectedFile);
  }

  if (dropzone) {
    dropzone.addEventListener("click", () => fileInput && fileInput.click());
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("drag-over");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        validateAndSetFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (btnSelectFile) {
    btnSelectFile.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput && fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        validateAndSetFile(e.target.files[0]);
      }
    });
  }

  function validateAndSetFile(file) {
    const ext = file.name.toLowerCase().split(".").pop();
    if (!["pdf", "docx", "txt"].includes(ext)) {
      UI.showError("Please upload a supported document (.pdf, .docx, .txt).");
      return;
    }
    setLoadedFile(file);
    UI.showToast(`Loaded ${file.name}`, "success");
  }

  // Clear JD button
  if (btnClearJd && jdTextarea) {
    btnClearJd.addEventListener("click", () => {
      jdTextarea.value = "";
      jdTextarea.focus();
    });
  }

  // ── BENCHMARK PROFILE LOADERS ──────────────────────────────
  function loadBenchmark(key) {
    const bm = BENCHMARKS[key];
    if (!bm) return;

    currentCandidateInfo = {
      candidateName: bm.candidateName,
      candidateId: bm.candidateId,
      targetRole: bm.role,
      email: bm.email,
      isBenchmark: true
    };

    if (targetRoleInput) targetRoleInput.value = bm.role;
    if (jdTextarea) jdTextarea.value = bm.jdText;

    setLoadedFile(null, bm.resumeText);
    UI.showToast(`Loaded ${bm.candidateName} benchmark profile`, "success");
  }

  if (btnSampleBackend) btnSampleBackend.addEventListener("click", () => loadBenchmark("backend"));
  if (btnSampleFrontend) btnSampleFrontend.addEventListener("click", () => loadBenchmark("frontend"));
  if (btnSampleMarketing) btnSampleMarketing.addEventListener("click", () => loadBenchmark("marketing"));

  // ── DOCUMENT TEXT EXTRACTION ───────────────────────────────
  async function extractResumeText(file) {
    if (simulatedResumeText) return simulatedResumeText;
    if (!file) throw new Error("No resume file uploaded.");

    const ext = file.name.toLowerCase().split(".").pop();

    if (ext === "txt") {
      return await file.text();
    }

    if (ext === "pdf") {
      if (typeof pdfjsLib === "undefined") {
        throw new Error("PDF parser loading. Please retry in a moment.");
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(it => it.str).join(" ") + "\n";
      }
      return fullText.trim();
    }

    if (ext === "docx") {
      if (typeof mammoth === "undefined") {
        throw new Error("DOCX parser loading. Please retry in a moment.");
      }
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    }

    throw new Error("Unsupported file extension.");
  }

  // ── MAIN ANALYSIS EXECUTION ────────────────────────────────
  if (analyseBtn) {
    analyseBtn.addEventListener("click", async () => {
      UI.hideError();

      if (!selectedFile && !simulatedResumeText) {
        UI.showError("Please upload a candidate resume or load a benchmark profile.");
        return;
      }

      const jdText = jdTextarea ? jdTextarea.value.trim() : "";
      if (!jdText) {
        UI.showError("Please provide the Job Description context.");
        return;
      }

      const targetRole = targetRoleInput ? targetRoleInput.value.trim() || "Senior Software Engineer" : "Senior Software Engineer";
      currentCandidateInfo.targetRole = targetRole;

      UI.showLoading();

      try {
        // 1. Extract text
        const resumeText = await extractResumeText(selectedFile);
        if (!resumeText || resumeText.length < 30) {
          throw new Error("Extracted resume text is too short. Please upload a detailed resume.");
        }

        // Try to infer candidate name if not benchmark
        if (!simulatedResumeText) {
          const firstLine = resumeText.split("\n")[0].trim().replace(/[^\w\s]/g, "");
          if (firstLine.length > 2 && firstLine.length < 35) {
            currentCandidateInfo.candidateName = firstLine;
          } else {
            currentCandidateInfo.candidateName = "Candidate Assessment";
          }
          currentCandidateInfo.candidateId = `CAN-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // 2. Call backend screening endpoint
        const screeningResult = await API.screenCandidate({
          resume_text: resumeText,
          jd_text: jdText,
          job_title: targetRole
        });

        latestAnalysisResult = screeningResult;

        // 3. Render all screening panels
        UI.renderScoreCard(screeningResult, currentCandidateInfo);

        UI.renderSkillsPanel({
          matched_technical_skills: screeningResult.matched_technical_skills || [],
          matched_soft_skills: screeningResult.matched_soft_skills || []
        });

        UI.renderStrengthsAndConcerns(
          screeningResult.strengths || [],
          screeningResult.areas_for_probing || []
        );

        UI.renderInterviewFocus(
          screeningResult.interview_preparation || {}
        );

        UI.renderGapsPanel({
          critical_missing_skills: screeningResult.critical_gaps || [],
          secondary_missing_skills: screeningResult.secondary_gaps || [],
          experience_discrepancies: screeningResult.experience_discrepancies || []
        });

        UI.renderImprovementsPanel(
          screeningResult.resume_improvements || {}
        );

        UI.renderInterviewPanel(
          screeningResult.interview_preparation || {}
        );

        // 4. Render Evaluation View
        UI.renderCandidateEvaluation(screeningResult, currentCandidateInfo);

        // 5. Save to History Repository in localStorage
        saveToHistory(screeningResult, currentCandidateInfo);

        // 6. Transition smoothly to Screening view
        UI.hideLoading();
        handleNavigation("screening");
        window.location.hash = "screening";
        UI.showToast("Cognitive screening completed successfully!", "success");

      } catch (err) {
        console.error("Screening failed:", err);
        UI.hideLoading();
        UI.showError(err.message || "An unexpected error occurred during cognitive analysis.");
      }
    });
  }

  // ── HISTORY REPOSITORY PERSISTENCE ─────────────────────────
  const STORAGE_KEY = "talentpulse_ai_history_v1";
  const DECISIONS_KEY = "talentpulse_ai_decisions_v1";

  function getHistoryRecords() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Could not parse history", e);
    }

    // Default Seed History matching Stitch Screenshot 4 (explicitly flagged as Demo Samples)
    return [
      {
        candidate_name: "Elena Vance",
        email: "elena.vance@stitch.ai",
        job_title: "Senior Product Designer",
        seniority: "SENIOR",
        match_score: 94,
        date: "Oct 24, 2024",
        isDemo: true,
        screeningResult: {
          match_score: 94,
          seniority_alignment: "Well-Matched",
          executive_summary: "Elena demonstrates top-tier systems design capability with deep design system leadership.",
          matched_technical_skills: [
            { skill: "Design Systems (Figma Tokens)", resume_evidence: "Architected multi-brand Figma library across 12 product lines." },
            { skill: "Prototyping & Micro-interactions", resume_evidence: "Built high-fidelity Framer prototypes reducing sprint rework by 30%." }
          ],
          strengths: ["10+ years Figma mastery", "Cross-functional leadership"],
          areas_for_probing: ["Verify team management scale in fast-growth environments"]
        }
      },
      {
        candidate_name: "Michael Kim",
        email: "m.kim@cloudinfra.net",
        job_title: "Staff Cloud Engineer",
        seniority: "STAFF",
        match_score: 87,
        date: "Oct 22, 2024",
        isDemo: true,
        screeningResult: {
          match_score: 87,
          seniority_alignment: "Well-Matched",
          executive_summary: "Robust Kubernetes and AWS footprint with strong infrastructure-as-code automation.",
          matched_technical_skills: [
            { skill: "AWS Architecture", resume_evidence: "Migrated legacy workload to multi-region EKS." },
            { skill: "Terraform", resume_evidence: "Automated 100% of environment provisioning." }
          ]
        }
      },
      {
        candidate_name: "Sarah Jenkins",
        email: "sarah.jenkins@growthpartners.co",
        job_title: "Head of Growth Marketing",
        seniority: "DIRECTOR",
        match_score: 79,
        date: "Oct 19, 2024",
        isDemo: true,
        screeningResult: {
          match_score: 79,
          seniority_alignment: "Well-Matched",
          executive_summary: "Data-driven performance marketer with proven track record scaling B2B SaaS pipelines."
        }
      }
    ];
  }

  function saveToHistory(screeningResult, info) {
    const records = getHistoryRecords();
    const newRecord = {
      candidate_name: info.candidateName,
      email: info.email || "applicant@recruitment.ai",
      job_title: info.targetRole,
      seniority: screeningResult.seniority_alignment === "Overqualified" ? "STAFF" : "SENIOR",
      match_score: screeningResult.match_score || 85,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      isDemo: false,
      isBenchmark: Boolean(info.isBenchmark),
      screeningResult: screeningResult
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    UI.renderHistoryTable(records);
  }

  function refreshHistoryTable(filter = "all", searchQuery = "") {
    let records = getHistoryRecords();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter(r => 
        (r.candidate_name && r.candidate_name.toLowerCase().includes(q)) ||
        (r.job_title && r.job_title.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q))
      );
    }

    if (filter === "real") {
      records = records.filter(r => !r.isDemo);
    } else if (filter === "demo") {
      records = records.filter(r => Boolean(r.isDemo));
    } else if (filter === "high-match") {
      records = records.filter(r => Number(r.match_score) >= 80);
    }

    UI.renderHistoryTable(records);

    // Attach click listeners to "View Assessment" buttons
    document.querySelectorAll(".btn-open-history").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = Number(btn.getAttribute("data-history-idx"));
        const rec = records[idx];
        if (rec && rec.screeningResult) {
          currentCandidateInfo = {
            candidateName: rec.candidate_name,
            candidateId: `CAN-${Math.floor(1000 + Math.random() * 9000)}`,
            targetRole: rec.job_title,
            email: rec.email,
            isBenchmark: Boolean(rec.isBenchmark),
            isDemo: Boolean(rec.isDemo)
          };
          latestAnalysisResult = rec.screeningResult;
          UI.renderScoreCard(rec.screeningResult, currentCandidateInfo);
          UI.renderSkillsPanel({
            matched_technical_skills: rec.screeningResult.matched_technical_skills || [],
            matched_soft_skills: rec.screeningResult.matched_soft_skills || []
          });
          UI.renderStrengthsAndConcerns(
            rec.screeningResult.strengths || [],
            rec.screeningResult.areas_for_probing || []
          );
          UI.renderInterviewFocus(rec.screeningResult.interview_preparation || {});
          UI.renderGapsPanel({
            critical_missing_skills: rec.screeningResult.critical_gaps || [],
            secondary_missing_skills: rec.screeningResult.secondary_gaps || [],
            experience_discrepancies: rec.screeningResult.experience_discrepancies || []
          });
          UI.renderImprovementsPanel(rec.screeningResult.resume_improvements || {});
          UI.renderInterviewPanel(rec.screeningResult.interview_preparation || {});
          UI.renderCandidateEvaluation(rec.screeningResult, currentCandidateInfo);

          handleNavigation("screening");
          UI.showToast(`Opened ${rec.candidate_name}'s assessment`, "info");
        }
      });
    });
  }

  // History search input
  if (historySearchInput) {
    historySearchInput.addEventListener("input", (e) => {
      const activePill = document.querySelector(".filter-pills-group .filter-pill.active");
      const filterMode = activePill ? activePill.getAttribute("data-filter") : "all";
      refreshHistoryTable(filterMode, e.target.value);
    });
  }

  // History filter pills
  document.querySelectorAll(".filter-pills-group .filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pills-group .filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const searchVal = historySearchInput ? historySearchInput.value : "";
      refreshHistoryTable(pill.getAttribute("data-filter"), searchVal);
    });
  });

  // ── ACTION BUTTONS & RECRUITER WORKFLOWS ────────────────────
  function recordDecision(status) {
    try {
      const stored = localStorage.getItem(DECISIONS_KEY) || "{}";
      const decisions = JSON.parse(stored);
      decisions[currentCandidateInfo.candidateName] = {
        status: status,
        candidateId: currentCandidateInfo.candidateId,
        role: currentCandidateInfo.targetRole,
        recordedAt: new Date().toISOString()
      };
      localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));
    } catch (e) {
      console.warn("Could not save decision locally", e);
    }
  }

  if (btnViewEvalDetail) {
    btnViewEvalDetail.addEventListener("click", () => {
      handleNavigation("evaluation");
      window.location.hash = "evaluation";
    });
  }

  if (btnEvalBack) {
    btnEvalBack.addEventListener("click", () => {
      handleNavigation("screening");
      window.location.hash = "screening";
    });
  }

  if (btnScheduleInterview || btnEvalMove) {
    const handler = () => {
      recordDecision("Interview Scheduled");
      UI.showToast(`Interview invitation dispatched to ${currentCandidateInfo.candidateName}! (Saved locally)`, "success");
    };
    if (btnScheduleInterview) btnScheduleInterview.addEventListener("click", handler);
    if (btnEvalMove) btnEvalMove.addEventListener("click", handler);
  }

  if (btnDecisionReject) {
    btnDecisionReject.addEventListener("click", () => {
      recordDecision("Rejected");
      UI.showToast(`Decision recorded: ${currentCandidateInfo.candidateName} marked as Rejected (saved locally).`, "error");
    });
  }

  if (btnDecisionHold) {
    btnDecisionHold.addEventListener("click", () => {
      recordDecision("On Hold");
      UI.showToast(`Decision recorded: ${currentCandidateInfo.candidateName} placed on Hold (saved locally).`, "info");
    });
  }

  if (btnDecisionAdvance) {
    btnDecisionAdvance.addEventListener("click", () => {
      recordDecision("Advanced to Interview");
      UI.showToast(`Decision recorded: ${currentCandidateInfo.candidateName} advanced to Technical Interview (saved locally).`, "success");
    });
  }

  // Export dossier report (downloads formatted JSON / Dossier)
  function exportReport() {
    if (!latestAnalysisResult) {
      UI.showToast("No active evaluation to export. Please run an analysis first.", "error");
      return;
    }
    const reportData = {
      candidate: currentCandidateInfo,
      analysis: latestAnalysisResult,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentCandidateInfo.candidateName.replace(/\s+/g, "_")}_Evaluation_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast("Exported structured candidate dossier!", "success");
  }

  function exportAllHistory() {
    const records = getHistoryRecords();
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TalentPulse_Analysis_Repository_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast("Exported all repository records!", "success");
  }

  if (btnExportPdf) btnExportPdf.addEventListener("click", exportReport);
  if (btnExportHistoryReport) btnExportHistoryReport.addEventListener("click", exportAllHistory);

  // Global search input
  if (globalSearchInput) {
    globalSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleNavigation("history");
        if (historySearchInput) {
          historySearchInput.value = globalSearchInput.value;
          refreshHistoryTable("all", globalSearchInput.value);
        }
      }
    });
  }

  // Initial Load: Render History Table and check Hash
  refreshHistoryTable();
  const initialHash = window.location.hash.replace("#", "") || "analyze";
  handleNavigation(initialHash);

  console.log("TalentPulse AI Enterprise Controller Initialized");
});
