import { AnalysisService } from "../services/analysisService.js";
import {
  ScreeningEvaluationResponse,
  CriticalMissingSkill,
} from "../types.js";

export class ScreeningWorker {
  constructor(private analysisService: AnalysisService) {}

  async run(
    resumeText: string,
    jdText: string,
    jobTitle: string
  ): Promise<ScreeningEvaluationResponse> {
    const trimmedResume = resumeText ? resumeText.trim() : "";
    const trimmedJd = jdText ? jdText.trim() : "";
    const trimmedTitle = jobTitle ? jobTitle.trim() : "Software Developer";

    if (!trimmedResume) {
      const err: any = new Error("Resume text is required.");
      err.status = 400;
      throw err;
    }
    if (!trimmedJd) {
      const err: any = new Error("Job description text is required.");
      err.status = 400;
      throw err;
    }
    if (trimmedResume.length < 100) {
      const err: any = new Error(
        "Resume text is too short for reliable screening."
      );
      err.status = 400;
      throw err;
    }
    if (trimmedJd.length < 50) {
      const err: any = new Error(
        "Job description is too short for reliable screening."
      );
      err.status = 400;
      throw err;
    }
    if (trimmedTitle.length < 2) {
      const err: any = new Error("Job title is too short.");
      err.status = 400;
      throw err;
    }

    // 1. High-level analysis
    const analysis = await this.analysisService.runAnalysis(
      trimmedResume,
      trimmedJd
    );

    // 2. Skill matching
    const matching = await this.analysisService.runSkillMatching(
      trimmedResume,
      trimmedJd
    );

    const matchedSkills = matching.matched_technical_skills.map(
      (item) => item.skill
    );

    // 3. Gap detection
    const gaps = await this.analysisService.runGapDetection(
      trimmedResume,
      trimmedJd,
      matchedSkills
    );

    const criticalGaps: CriticalMissingSkill[] = gaps.critical_missing_skills;
    const secondaryGaps: CriticalMissingSkill[] = gaps.secondary_missing_skills;
    const experienceGaps: string[] = gaps.experience_discrepancies;

    // 4. Resume improvements
    const improvements = await this.analysisService.runImprovements(
      trimmedResume,
      trimmedTitle,
      criticalGaps
    );

    // 5. Interview preparation
    const missingSkills = [...criticalGaps, ...secondaryGaps];
    const interviewPreparation = await this.analysisService.runInterviewPrep(
      trimmedJd,
      matchedSkills,
      missingSkills
    );

    // 6. Risk identification
    const risks: string[] = [];
    if (criticalGaps.length > 0) {
      risks.push(
        "One or more required job qualifications are not demonstrated in the resume."
      );
    }
    if (experienceGaps.length > 0) {
      risks.push(...experienceGaps);
    }
    if (matchedSkills.length === 0) {
      risks.push("No directly matched technical skills were identified.");
    }
    if (analysis.major_concerns.length > 0) {
      risks.push(...analysis.major_concerns);
    }
    const deduplicatedRisks = Array.from(new Set(risks));

    // 7. Information requiring verification
    const infoRequiringVerification: string[] = [];
    if (criticalGaps.length > 0) {
      infoRequiringVerification.push(
        ...criticalGaps.map(
          (gap) =>
            `Verify whether the candidate has experience with the required skill: ${gap.skill}.`
        )
      );
    }
    if (experienceGaps.length > 0) {
      infoRequiringVerification.push(...experienceGaps);
    }
    if (analysis.major_concerns.length > 0) {
      infoRequiringVerification.push(...analysis.major_concerns);
    }
    const deduplicatedVerification = Array.from(
      new Set(infoRequiringVerification)
    );

    // 8. Human escalation decision
    let escalationRequired = false;
    let escalationReason: string | null = null;

    if (criticalGaps.length > 0) {
      escalationRequired = true;
      escalationReason =
        "Required qualifications are missing or not demonstrated in the supplied resume. Human verification is required.";
    } else if (experienceGaps.length > 0) {
      escalationRequired = true;
      escalationReason =
        "Potential experience or seniority discrepancy requires human review.";
    } else if (analysis.major_concerns.length > 0) {
      escalationRequired = true;
      escalationReason =
        "Potential screening concerns require human verification before proceeding.";
    }

    // 9. Recommendation
    const recommendation = "Proceed to Human Review";

    // 10. Next steps
    const nextSteps: string[] = [];
    if (escalationRequired) {
      nextSteps.push(
        "Recruiter should verify the identified concerns before making a hiring decision."
      );
    }
    if (criticalGaps.length > 0) {
      nextSteps.push(
        "Confirm whether the candidate has the required skills that are not demonstrated in the resume."
      );
    }
    if (experienceGaps.length > 0) {
      nextSteps.push(
        "Verify the candidate's actual experience and seniority against the job requirements."
      );
    }
    if (nextSteps.length === 0) {
      nextSteps.push(
        "Recruiter should review the structured evaluation and determine the next appropriate action."
      );
    }

    return {
      match_score: analysis.match_score,
      recommendation,
      seniority_alignment: analysis.seniority_alignment,
      executive_summary: analysis.executive_summary,
      strengths: analysis.top_strengths,
      matched_technical_skills: matching.matched_technical_skills,
      matched_soft_skills: matching.matched_soft_skills,
      critical_gaps: criticalGaps,
      secondary_gaps: secondaryGaps,
      experience_discrepancies: experienceGaps,
      risks: deduplicatedRisks,
      resume_improvements: improvements,
      interview_preparation: interviewPreparation,
      information_requiring_verification: deduplicatedVerification,
      next_steps: nextSteps,
      escalation_required: escalationRequired,
      escalation_reason: escalationReason,
    };
  }
}
