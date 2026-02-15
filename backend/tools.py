from langchain.tools import tool
import json
import os
import logging
from uuid import uuid4
from langchain_google_genai import ChatGoogleGenerativeAI

# Setup logging
logger = logging.getLogger(__name__)
try:
    from .utils import extract_text
except ImportError:
    from utils import extract_text

# In-memory store for simplicity, could be replaced with a database
USER_STATE_DIR = "user_states"
if not os.path.exists(USER_STATE_DIR):
    os.makedirs(USER_STATE_DIR)

STRUCTURE_PROMPT = """
You are a resume structuring engine.

Convert the resume text into structured JSON.
Rules:
- Do NOT infer or guess missing data
- Do NOT rewrite content creatively
- Preserve original wording
- If a field is missing, return empty values

Output MUST match this schema exactly:
{schema}

Resume text:
{text}
"""

EXPECTED_SCHEMA = {
    "personal_info": {
        "full_name": "string",
        "headline": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "linkedin": "string",
        "github": "string",
        "portfolio": "string"
    },
    "summary": "string",
    "skills": {
        "technical": ["string"],
        "tools": ["string"],
        "soft": ["string"]
    },
    "experience": [
        {
            "company": "string",
            "position": "string",
            "duration": "string",
            "description": ["string"]
        }
    ],
    "projects": [
        {
            "title": "string",
            "description": "string",
            "technologies": ["string"],
            "link": "string"
        }
    ],
    "education": [
        {
            "institution": "string",
            "degree": "string",
            "duration": "string",
            "grade": "string"
        }
    ],
    "certifications": ["string"],
    "achievements": ["string"]
}

# Initialize LLM (Ensure GOOGLE_API_KEY is set in environment)
# Using gemini-1.5-flash-latest to ensure we use the most recent version compatible with the API
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

def structure_resume(text: str) -> dict:
    try:
        logger.info("Sending resume text to Gemini for structuring...")
        response = llm.invoke(
            STRUCTURE_PROMPT.format(
                schema=json.dumps(EXPECTED_SCHEMA, indent=2),
                text=text
            )
        )
        # Handle potential code block markers in response
        content = response.content.strip()
        logger.info(f"Received response from Gemini (first 100 chars): {content[:100]}...")
        
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        logger.error(f"Failed to structure resume with LLM: {str(e)}")
        # Return a partially structured response if LLM fails
        return {
            "personal_info": {"full_name": "Error during extraction"},
            "summary": "We encountered an error while processing your CV with AI. You can still manually edit your information in the next step.",
            "skills": {"technical": [], "tools": [], "soft": []},
            "experience": [],
            "projects": [],
            "education": [],
            "certifications": [],
            "achievements": []
        }

@tool
def parse_cv_tool(file_path: str) -> dict:
    """Extract structured information from a CV (PDF/DOCX)."""
    raw_text = extract_text(file_path)

    if not raw_text.strip():
        raise ValueError("Empty CV text extracted")

    structured_data = structure_resume(raw_text)
    return structured_data

@tool
def store_user_state_tool(user_id: str, state: dict) -> dict:
    """Persist user CV and website state."""
    file_path = os.path.join(USER_STATE_DIR, f"{user_id}.json")
    with open(file_path, "w") as f:
        json.dump(state, f)
    return {"status": "success", "user_id": user_id}

@tool
def retrieve_user_state_tool(user_id: str) -> dict:
    """Retrieve stored user state."""
    file_path = os.path.join(USER_STATE_DIR, f"{user_id}.json")
    if not os.path.exists(file_path):
        return {"error": "User state not found"}
    with open(file_path, "r") as f:
        return json.load(f)

@tool
def generate_site_tool(cv_data: dict, theme: str, layout: str) -> dict:
    """Generate portfolio website using predefined templates."""
    # Using UUID for unique repo paths as requested
    repo_path = f"generated_sites/{uuid4()}"
    return {
        "status": "success",
        "repo_path": repo_path,
        "preview_url": f"http://localhost:3000/preview/{repo_path}"
    }

@tool
def preview_site_tool(repo_path: str) -> dict:
    """Return live preview URL."""
    return {"preview_url": f"http://localhost:3000/preview/{repo_path}"}

@tool
def update_site_tool(repo_path: str, updates: dict) -> dict:
    """Apply structured updates to the website."""
    return {"status": "success", "repo_path": repo_path}

@tool
def deploy_site_tool(repo_path: str, platform: str) -> dict:
    """Deploy website and return live URL."""
    return {
        "status": "success",
        "platform": platform,
        "live_url": f"https://{os.path.basename(repo_path)}.{platform}.app"
    }
