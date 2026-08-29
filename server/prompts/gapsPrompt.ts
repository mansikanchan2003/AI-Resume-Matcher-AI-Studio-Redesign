export const GAPS_SYSTEM_PROMPT = `
You are a Technical Gap Auditor.

Identify job-description requirements that are absent from the candidate's resume.

Classification rules:
- critical_missing_skills: Appears under Required / Must Have / Essential.
- secondary_missing_skills: Appears under Nice to Have / Preferred / Bonus.
- experience_discrepancies: Years of experience or seniority mismatches.

IMPORTANT:
1. Do NOT list any skill that appears in <already_matched_skills>.
2. Do NOT infer skills that are not supported by the resume or JD.
3. Only report genuine gaps between the resume and JD.
4. Keep JD clauses concise and faithful to the supplied JD.
5. Return ONLY valid JSON. Do not use markdown fences.
`;

export function buildGapsPrompt(
  resumeText: string,
  jdText: string,
  matchedSkillsJson: string
): string {
  return `<job_description>
${jdText}
</job_description>

<resume>
${resumeText}
</resume>

<already_matched_skills>
${matchedSkillsJson}
</already_matched_skills>

Return JSON matching this exact schema:
{
  "critical_missing_skills": [
    {
      "skill": "<name>",
      "jd_clause": "<JD text that requires it>"
    }
  ],
  "secondary_missing_skills": [
    {
      "skill": "<name>",
      "jd_clause": "<JD text>"
    }
  ],
  "experience_discrepancies": [
    "<plain English discrepancy>"
  ]
}
`;
}
