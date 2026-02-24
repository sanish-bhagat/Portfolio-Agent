def build_refinement_prompt(parsed_json: dict) -> str:
    return f"""
You are a strict resume data normalizer.

Your job is to CLEAN and NORMALIZE the provided parsed resume JSON.

You MUST follow these rules:

-------------------------
STRICT RULES
-------------------------

1. DO NOT invent new information.
2. DO NOT add new skills.
3. DO NOT add new companies.
4. DO NOT modify dates unless clearly embedded in a field.
5. DO NOT guess missing values.
6. DO NOT create new fields.
7. DO NOT remove existing factual information.
8. If something is unclear, leave it unchanged.
9. Return STRICTLY VALID JSON.
10. Do NOT include explanations.
11. Do NOT include markdown.
12. Do NOT include text outside JSON.

-------------------------
ALLOWED OPERATIONS
-------------------------

You MAY:

- Extract start_date and end_date if embedded inside role field.
- Clean role titles by removing date text from them.
- Split tech stack lines into list items.
- Remove duplicate skills.
- Normalize known equivalents:
    - "RESTful API" → "REST"
    - "HTML5" → "HTML"
    - "CSS3" → "CSS"
- Remove obvious formatting artifacts.
- Move tech stack lines out of description into tech_stack array.

-------------------------
EXPECTED JSON SCHEMA
-------------------------

The output must strictly follow this structure:

{{
  "name": string,
  "contact": {{
    "email": string,
    "phone": string,
    "links": list,
    "location": string
  }},
  "summary": string,
  "skills": list,
  "education": list,
  "experience": [
    {{
      "role": string,
      "company": string,
      "start_date": string,
      "end_date": string,
      "description": list,
      "tech_stack": list
    }}
  ],
  "projects": [
    {{
      "title": string,
      "description": list,
      "tech_stack": list
    }}
  ],
  "certifications": list
}}

If any field is missing, keep it as empty string or empty list.
Do NOT remove keys.

If you are unsure about any transformation, return the original JSON unchanged.

-------------------------
INPUT JSON
-------------------------

{parsed_json}

-------------------------
OUTPUT
-------------------------
Return ONLY valid JSON.
"""