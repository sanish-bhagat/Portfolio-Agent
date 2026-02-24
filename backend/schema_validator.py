import json
from prompt import build_refinement_prompt

EXPECTED_SCHEMA = {
    "name": str,
    "contact": dict,
    "summary": str,
    "skills": list,
    "education": list,
    "experience": list,
    "projects": list,
    "certifications": list
}

import re

def extract_json_block(text: str) -> str:
    """
    Robustly extract JSON from LLM output.
    Handles:
    1. Markdown code blocks (```json ... ```)
    2. Plain JSON starting with { and ending with }
    3. Conversational noise before/after JSON
    """
    text = text.strip()
    
    # Pattern 1: Markdown code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return match.group(1)
        
    # Pattern 2: Find outermost braces if no code block
    # This is a simple heuristic: find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    
    if start != -1 and end != -1 and end > start:
        return text[start:end+1]
        
    return text

def validate_schema(llm_output: str, original_json: dict) -> dict:
    """
    Validates LLM output against strict schema.
    If validation fails, returns original_json.
    """
    
    if isinstance(llm_output, dict):
        # Already a dict (e.g. from LangChain object output parser)
        data = llm_output
    else:
        # String output
        cleaned_output = extract_json_block(str(llm_output))
        try:
            data = json.loads(cleaned_output)
        except Exception as e:
            print(f"❌ Invalid JSON from LLM: {e}. Falling back.")
            print(f"Snippet: {cleaned_output[:100]}...")
            return original_json

    # 1️⃣ Top-level key check
    if set(data.keys()) != set(EXPECTED_SCHEMA.keys()):
        print("❌ Schema keys mismatch. Falling back.")
        return original_json

    # 2️⃣ Type validation
    for key, expected_type in EXPECTED_SCHEMA.items():
        if not isinstance(data[key], expected_type):
            print(f"❌ Type mismatch in field: {key}")
            return original_json

    # 3️⃣ Contact validation
    if not isinstance(data["contact"], dict):
        return original_json

    required_contact_keys = {"email", "phone", "links", "location"}
    if set(data["contact"].keys()) != required_contact_keys:
        print("❌ Contact structure invalid.")
        return original_json

    # 4️⃣ Experience structure validation
    for exp in data["experience"]:
        required_exp_keys = {
            "role", "company", "start_date",
            "end_date", "description", "tech_stack"
        }

        if set(exp.keys()) != required_exp_keys:
            print("❌ Experience schema mismatch.")
            return original_json

        if not isinstance(exp["description"], list):
            return original_json

        if not isinstance(exp["tech_stack"], list):
            return original_json

    # 5️⃣ Projects structure validation
    for proj in data["projects"]:
        required_proj_keys = {"title", "description", "tech_stack"}

        if set(proj.keys()) != required_proj_keys:
            print("❌ Project schema mismatch.")
            return original_json

        if not isinstance(proj["description"], list):
            return original_json

        if not isinstance(proj["tech_stack"], list):
            return original_json

    return data

def guard_against_hallucinated_skills(cleaned_json, original_json):
    original_skills = set(original_json.get("skills", []))
    cleaned_skills = set(cleaned_json.get("skills", []))

    # If LLM added new skills not present originally → reject
    if not cleaned_skills.issubset(original_skills):
        print("❌ Hallucinated skills detected.")
        return original_json

    return cleaned_json

def refine_with_validation(llm, original_data: dict) -> dict:
    """
    If schema validation fails, use LLM to fix the structure.
    """
    
    prompt = f"""
    You are a strict JSON formatter. Fix the following JSON to match the required schema.
    
    REQUIRED SCHEMA:
    {{
        "name": "Full Name",
        "contact": {{ "email": "", "phone": "", "links": [], "location": "" }},
        "summary": "",
        "skills": ["Skill1", "Skill2"],
        "education": [{{ "degree": "", "institution": "", "year": "" }}],
        "experience": [
            {{ 
                "role": "", 
                "company": "", 
                "start_date": "", 
                "end_date": "", 
                "description": ["bullet1"], 
                "tech_stack": ["Tech1"] 
            }}
        ],
        "projects": [
            {{ "title": "", "description": ["bullet1"], "tech_stack": ["Tech1"] }}
        ],
        "certifications": []
    }}

    INSTRUCTIONS:
    1. Fix any broken fields.
    2. Ensure dates are separated from roles/titles.
    3. Ensure 'tech_stack' is always a list of strings.
    4. Ensure 'description' is always a list of strings.
    5. OUTPUT ONLY VALID JSON. NO MARKDOWN. NO CONVERSATIONAL TEXT.

    INPUT DATA:
    {json.dumps(original_data, indent=2)}
    """
    
    response = llm.invoke(prompt)
    
    # Extract content from AIMessage
    content = response.content if hasattr(response, 'content') else str(response)
    
    return validate_schema(content, original_data)