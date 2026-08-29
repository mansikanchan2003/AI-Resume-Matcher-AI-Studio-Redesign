import { LLMService } from "./llmService.js";
import {
  AnalysisResponse,
  SkillMatchResponse,
  GapDetectionResponse,
  ImprovementResponse,
  InterviewQuestionsResponse,
  CriticalMissingSkill,
} from "../types.js";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisPrompt,
} from "../prompts/analysisPrompt.js";
import {
  MATCHING_SYSTEM_PROMPT,
  buildMatchingPrompt,
} from "../prompts/matchingPrompt.js";
import {
  GAPS_SYSTEM_PROMPT,
  buildGapsPrompt,
} from "../prompts/gapsPrompt.js";
import {
  IMPROVEMENT_SYSTEM_PROMPT,
  buildImprovementPrompt,
} from "../prompts/improvementPrompt.js";
import {
  INTERVIEW_SYSTEM_PROMPT,
  buildInterviewPrompt,
} from "../prompts/interviewPrompt.js";

export class AnalysisService {
  constructor(private llm: LLMService) {}

  async runAnalysis(
    resumeText: string,
    jdText: string
  ): Promise<AnalysisResponse> {
    const userPrompt = buildAnalysisPrompt(resumeText, jdText);
    return await this.llm.complete<AnalysisResponse>(
      ANALYSIS_SYSTEM_PROMPT,
      userPrompt,
      (data) => {
        return {
          match_score: typeof data.match_score === "number" ? Math.min(100, Math.max(0, Math.round(data.match_score))) : 50,
          seniority_alignment: ["Underqualified", "Well-Matched", "Overqualified"].includes(data.seniority_alignment)
            ? data.seniority_alignment
            : "Well-Matched",
          executive_summary: String(data.executive_summary || "Analysis completed."),
          top_strengths: Array.isArray(data.top_strengths) ? data.top_strengths.map(String) : [],
          major_concerns: Array.isArray(data.major_concerns) ? data.major_concerns.map(String) : [],
        };
      }
    );
  }

  async runSkillMatching(
    resumeText: string,
    jdText: string
  ): Promise<SkillMatchResponse> {
    const userPrompt = buildMatchingPrompt(resumeText, jdText);
    return await this.llm.complete<SkillMatchResponse>(
      MATCHING_SYSTEM_PROMPT,
      userPrompt,
      (data) => {
        return {
          matched_technical_skills: Array.isArray(data.matched_technical_skills)
            ? data.matched_technical_skills.map((item: any) => ({
                skill: String(item.skill || ""),
                resume_evidence: String(item.resume_evidence || ""),
                jd_requirement: String(item.jd_requirement || ""),
              }))
            : [],
          matched_soft_skills: Array.isArray(data.matched_soft_skills)
            ? data.matched_soft_skills.map(String)
            : [],
        };
      }
    );
  }

  async runGapDetection(
    resumeText: string,
    jdText: string,
    matchedSkills: string[]
  ): Promise<GapDetectionResponse> {
    const matchedSkillsJson = JSON.stringify(matchedSkills, null, 2);
    const userPrompt = buildGapsPrompt(resumeText, jdText, matchedSkillsJson);
    return await this.llm.complete<GapDetectionResponse>(
      GAPS_SYSTEM_PROMPT,
      userPrompt,
      (data) => {
        const parseGaps = (arr: any[]): CriticalMissingSkill[] =>
          Array.isArray(arr)
            ? arr.map((item: any) => ({
                skill: String(item.skill || ""),
                jd_clause: String(item.jd_clause || ""),
              }))
            : [];

        return {
          critical_missing_skills: parseGaps(data.critical_missing_skills),
          secondary_missing_skills: parseGaps(data.secondary_missing_skills),
          experience_discrepancies: Array.isArray(data.experience_discrepancies)
            ? data.experience_discrepancies.map(String)
            : [],
        };
      }
    );
  }

  async runImprovements(
    resumeText: string,
    jobTitle: string,
    criticalGaps: Array<{ skill: string; jd_clause: string }>
  ): Promise<ImprovementResponse> {
    const criticalGapsJson = JSON.stringify(criticalGaps, null, 2);
    const userPrompt = buildImprovementPrompt(
      resumeText,
      jobTitle,
      criticalGapsJson
    );
    return await this.llm.complete<ImprovementResponse>(
      IMPROVEMENT_SYSTEM_PROMPT,
      userPrompt,
      (data) => {
        return {
          tailored_summary_statement: String(
            data.tailored_summary_statement || ""
          ),
          star_bullet_recommendations: Array.isArray(
            data.star_bullet_recommendations
          )
            ? data.star_bullet_recommendations.map((item: any) => ({
                target_skill: String(item.target_skill || ""),
                current_resume_context: String(
                  item.current_resume_context || ""
                ),
                suggested_star_bullet: String(
                  item.suggested_star_bullet || ""
                ),
                improvement_reason: String(item.improvement_reason || ""),
              }))
            : [],
          high_value_keywords_to_include: Array.isArray(
            data.high_value_keywords_to_include
          )
            ? data.high_value_keywords_to_include.map(String)
            : [],
        };
      }
    );
  }

  async runInterviewPrep(
    jdText: string,
    matchedSkills: string[],
    missingSkills: Array<{ skill: string; jd_clause: string }>
  ): Promise<InterviewQuestionsResponse> {
    const matchedSkillsJson = JSON.stringify(matchedSkills, null, 2);
    const missingSkillsJson = JSON.stringify(missingSkills, null, 2);
    const userPrompt = buildInterviewPrompt(
      jdText,
      matchedSkillsJson,
      missingSkillsJson
    );
    return await this.llm.complete<InterviewQuestionsResponse>(
      INTERVIEW_SYSTEM_PROMPT,
      userPrompt,
      (data) => {
        return {
          technical_questions: Array.isArray(data.technical_questions)
            ? data.technical_questions.map((item: any) => ({
                question: String(item.question || ""),
                focus_area: String(item.focus_area || "General"),
                evaluation_criteria: String(item.evaluation_criteria || ""),
              }))
            : [],
          behavioural_questions: Array.isArray(data.behavioural_questions)
            ? data.behavioural_questions.map((item: any) => ({
                question: String(item.question || ""),
                competency: String(item.competency || "General"),
                evaluation_criteria: String(item.evaluation_criteria || ""),
              }))
            : [],
        };
      }
    );
  }
}
