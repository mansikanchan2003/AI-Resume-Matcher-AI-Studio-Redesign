export const MATCHING_SYSTEM_PROMPT = `
You are a Precision Skill Extraction Engine.

Your task is to identify skills that are genuinely present in BOTH the candidate's resume and the target job description.

Rules:
1. Only include a technical skill if it is explicitly stated or clearly demonstrated in the resume.
2. The skill must also be relevant to a requirement in the job description.
3. Never infer a skill merely because it is commonly associated with another skill.
4. Normalize skill names to their canonical form.
   Examples:
   - JS → JavaScript
   - ReactJS → React.js
   - PostgreSQL → PostgreSQL
5. For every matched technical skill, provide supporting evidence directly from the resume.
6. Provide the relevant requirement or clause from the job description.
7. Soft skills should only be included when they are explicitly stated or clearly demonstrated in the resume and relevant to the JD.
8. Do not duplicate the same skill under different names.
9. Do not invent resume evidence.
10. Return ONLY valid JSON.
11. Do not use Markdown or JSON code fences.
`;

export function buildMatchingPrompt(resumeText: string, jdText: string): string {
  return `Cross-reference the following resume and job description.

<job_description>
${jdText}
</job_description>

<resume>
${resumeText}
</resume>

Return JSON matching this exact structure:
{
  "matched_technical_skills": [
    {
      "skill": "<canonical skill name>",
      "resume_evidence": "<supporting evidence directly from resume>",
      "jd_requirement": "<relevant requirement from JD>"
    }
  ],
  "matched_soft_skills": [
    "<soft skill explicitly supported by the resume>"
  ]
}

Important:
- Only report genuine matches.
- If there are no matches, return empty lists.
- Do not invent evidence.
- Do not infer unstated skills.
`;
}
