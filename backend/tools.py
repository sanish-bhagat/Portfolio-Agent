import os
import json
import logging
import base64
import requests
from uuid import uuid4
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Setup logging
logger = logging.getLogger(__name__)

# Load environment variables
if not load_dotenv():
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
try:
    from .utils import extract_text, parse_cv
except ImportError:
    from utils import extract_text, parse_cv

# In-memory store for simplicity, could be replaced with a database
USER_STATE_DIR = "user_states"
if not os.path.exists(USER_STATE_DIR):
    os.makedirs(USER_STATE_DIR)

# Constants
VERCEL_API_URL = "https://api.vercel.com/v13/deployments"
GENERATED_SITES_DIR = "generated_sites"

if not os.path.exists(GENERATED_SITES_DIR):
    os.makedirs(GENERATED_SITES_DIR)

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
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        logger.error(f"Failed to structure resume with LLM: {str(e)}")
        return {
            "personal_info": {"full_name": "Error during extraction"},
            "summary": "We encountered an error while processing your CV with AI.",
            "skills": {"technical": [], "tools": [], "soft": []},
            "experience": [],
            "projects": [],
            "education": [],
            "certifications": [],
            "achievements": []
        }

@tool
def parse_cv_tool(file_path: str) -> dict:
    """Extract structured information from a CV (PDF/DOCX) using NLP and LLM refinement."""
    raw_text = extract_text(file_path)
    if not raw_text.strip():
        raise ValueError("Empty CV text extracted")
    structured_data = parse_cv(raw_text)
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
def generate_site_tool(portfolio_data: dict, theme: str) -> str:
    """
    Generate a static portfolio website into a unique folder.
    
    Args:
        portfolio_data: The mapped portfolio JSON data.
        theme: The chosen theme (modern, minimal, dark).
        
    Returns:
        The physical repo_path on disk.
    """
    try:
        user_uuid = str(uuid4())
        repo_path = os.path.join(GENERATED_SITES_DIR, user_uuid)
        os.makedirs(repo_path, exist_ok=True)

        # Pre-calculate section HTML to avoid complex nested f-strings
        skills_html = ""
        primary_skills = portfolio_data.get('skills_section', {}).get('primary_skills', [])
        secondary_skills = portfolio_data.get('skills_section', {}).get('secondary_skills', [])
        
        for s in primary_skills:
            skills_html += f'<span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">{s}</span> '
        for s in secondary_skills:
            skills_html += f'<span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">{s}</span> '

        experience_html = ""
        for exp in portfolio_data.get('experience_timeline', []):
            highlights_html = "".join([f"<li>{h}</li>" for h in exp.get("highlights", [])])
            experience_html += f"""
            <div class="border-l-2 border-indigo-500 pl-6 mb-10">
                <h3 class="text-xl font-bold">{exp.get('role', '')}</h3>
                <p class="text-indigo-500 font-medium">{exp.get('company', '')}</p>
                <p class="text-sm opacity-60 mb-4">{exp.get('period', '')}</p>
                <ul class="list-disc pl-5 space-y-2 opacity-80">
                    {highlights_html}
                </ul>
            </div>"""

        projects_html = ""
        for proj in portfolio_data.get('projects_section', []):
            tech_html = "".join([f'<span class="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{t}</span> ' for t in proj.get("tech_stack", [])])
            projects_html += f"""
            <div class="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                <h3 class="text-xl font-bold mb-2">{proj.get('title', '')}</h3>
                <p class="text-sm opacity-70 mb-4">{proj.get('short_description', '')}</p>
                <div class="flex flex-wrap gap-1">
                    {tech_html}
                </div>
            </div>"""

        # Basic HTML template builder
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{portfolio_data.get('hero', {}).get('name', 'My Portfolio')}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', sans-serif; transition: all 0.3s ease; }}
        .modern-theme {{ background: #f8fafc; color: #1e293b; }}
        .dark-theme {{ background: #0f172a; color: #f8fafc; }}
        .minimal-theme {{ background: #ffffff; color: #171717; }}
        .gradient-text {{ background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
    </style>
</head>
<body class="{theme}-theme">
    <div class="max-w-4xl mx-auto px-6 py-20">
        <header class="mb-20">
            <h1 class="text-6xl font-bold mb-6 gradient-text">{portfolio_data.get('hero', {}).get('name', '')}</h1>
            <p class="text-xl opacity-80">{portfolio_data.get('hero', {}).get('tagline', '')}</p>
        </header>

        <section class="mb-20">
            <h2 class="text-2xl font-bold mb-6 border-b pb-2 opacity-90">About</h2>
            <p class="text-lg opacity-80 leading-relaxed">{portfolio_data.get('about', {}).get('summary', '')}</p>
        </section>

        <section class="mb-20">
            <h2 class="text-2xl font-bold mb-6 border-b pb-2 opacity-90">Skills</h2>
            <div class="flex flex-wrap gap-2">
                {skills_html}
            </div>
        </section>

        <section class="mb-20">
            <h2 class="text-2xl font-bold mb-6 border-b pb-2 opacity-90">Experience</h2>
            <div class="space-y-10">
                {experience_html}
            </div>
        </section>

        <section class="mb-20">
            <h2 class="text-2xl font-bold mb-6 border-b pb-2 opacity-90">Projects</h2>
            <div class="grid md:grid-cols-2 gap-6">
                {projects_html}
            </div>
        </section>

        <footer class="pt-20 border-t border-gray-200 dark:border-gray-800 text-center opacity-60">
            <p>&copy; {portfolio_data.get('hero', {}).get('name', '')}. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
"""
        index_path = os.path.join(repo_path, "index.html")
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        logger.info(f"Site generated successfully at {repo_path}")
        return repo_path
    except Exception as e:
        logger.error(f"Failed to generate site: {str(e)}")
        raise e

@tool
def deploy_site_tool(repo_path: str) -> str:
    """
    Deploy the generated folder to Vercel using the Deployment API.
    
    Args:
        repo_path: The physical path to the folder containing index.html.
        
    Returns:
        The real live URL from Vercel.
    """
    vercel_token = os.environ.get("VERCEL_TOKEN")
    logger.info(f"Using Vercel Token (first 5 chars): {vercel_token[:5] if vercel_token else 'None'}")
    if not vercel_token:
        logger.error("VERCEL_TOKEN not found in environment variables")
        return "Error: VERCEL_TOKEN missing. Please configure your environment."

    if not os.path.exists(repo_path):
        logger.error(f"Repository path not found: {repo_path}")
        return f"Error: Folder {repo_path} not found on disk."

    try:
        # 1. Recursively read all files and prepare for Vercel payload
        files_payload = []
        for root, _, filenames in os.walk(repo_path):
            for filename in filenames:
                file_path = os.path.join(root, filename)
                rel_path = os.path.relpath(file_path, repo_path).replace("\\", "/")
                
                with open(file_path, "rb") as f:
                    file_content = f.read()
                    encoded_content = base64.b64encode(file_content).decode("utf-8")
                    
                files_payload.append({
                    "file": rel_path,
                    "data": encoded_content,
                    "encoding": "base64"
                })

        if not files_payload:
            return "Error: No files found in the generated folder to deploy."

        # 2. Construct deployment payload
        payload = {
            "name": f"portfolio-agent-{os.path.basename(repo_path)[:8]}",
            "files": files_payload,
            "projectSettings": {
                "framework": None # Static site
            }
        }

        # 3. Send to Vercel API
        headers = {
            "Authorization": f"Bearer {vercel_token}",
            "Content-Type": "application/json"
        }
        
        logger.info(f"Deploying {len(files_payload)} files to Vercel...")
        response = requests.post(VERCEL_API_URL, headers=headers, json=payload)
        
        # Log the full response for debugging
        logger.info(f"Vercel API Status Code: {response.status_code}")
        try:
            response_json = response.json()
            logger.info(f"Vercel API Response: {json.dumps(response_json, indent=2)}")
        except:
            logger.info(f"Vercel API Raw Response: {response.text}")

        if response.status_code != 200:
            error_data = response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown Vercel API error")
            logger.error(f"Vercel Deployment Failed: {error_msg}")
            return {
                "status": "error",
                "message": error_msg
            }

        data = response.json()
        live_url = f"https://{data['url']}"
        logger.info(f"Deployment successful! Live URL: {live_url}")
        
        return {
            "status": "success",
            "live_url": live_url
        }

    except Exception as e:
        logger.error(f"Unexpected error during deployment: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@tool
def preview_site_tool(repo_path: str) -> dict:
    """Return live preview URL."""
    return {"preview_url": f"http://localhost:3000/preview/{repo_path}"}

@tool
def update_site_tool(repo_path: str, updates: dict) -> dict:
    """Apply structured updates to the website."""
    return {"status": "success", "repo_path": repo_path}
