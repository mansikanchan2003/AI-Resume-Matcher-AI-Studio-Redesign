export type SeniorityAlignment = "Underqualified" | "Well-Matched" | "Overqualified";

export interface AnalysisResponse {
  match_score: number;
  seniority_alignment: SeniorityAlignment;
  executive_summary: string;
  top_strengths: string[];
  major_concerns: string[];
}

export interface MatchedTechnicalSkill {
  skill: string;
  resume_evidence: string;
  jd_requirement: string;
}

export interface SkillMatchResponse {
  matched_technical_skills: MatchedTechnicalSkill[];
  matched_soft_skills: string[];
}

export interface CriticalMissingSkill {
  skill: string;
  jd_clause: string;
}

export interface GapDetectionResponse {
  critical_missing_skills: CriticalMissingSkill[];
  secondary_missing_skills: CriticalMissingSkill[];
  experience_discrepancies: string[];
}

export interface StarBulletRecommendation {
  target_skill: string;
  current_resume_context: string;
  suggested_star_bullet: string;
  improvement_reason: string;
}

export interface ImprovementResponse {
  tailored_summary_statement: string;
  star_bullet_recommendations: StarBulletRecommendation[];
  high_value_keywords_to_include: string[];
}

export interface TechnicalQuestion {
  question: string;
  focus_area: string;
  evaluation_criteria: string;
}

export interface BehaviouralQuestion {
  question: string;
  competency: string;
  evaluation_criteria: string;
}

export interface InterviewQuestionsResponse {
  technical_questions: TechnicalQuestion[];
  behavioural_questions: BehaviouralQuestion[];
}

export type ScreeningRecommendation = "Proceed to Human Review" | "Needs More Information";

export interface ScreeningEvaluationResponse {
  match_score: number;
  recommendation: ScreeningRecommendation;
  seniority_alignment: SeniorityAlignment;
  executive_summary: string;
  strengths: string[];
  matched_technical_skills: MatchedTechnicalSkill[];
  matched_soft_skills: string[];
  critical_gaps: CriticalMissingSkill[];
  secondary_gaps: CriticalMissingSkill[];
  experience_discrepancies: string[];
  risks: string[];
  resume_improvements: ImprovementResponse;
  interview_preparation: InterviewQuestionsResponse;
  information_requiring_verification: string[];
  next_steps: string[];
  escalation_required: boolean;
  escalation_reason: string | null;
}
