# llm_enhancer.py

from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
from typing import List, Dict
import os

# Controlled creativity
llm = ChatOllama(
    model="llama3:8b",
    temperature=0.3
)


def _call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Internal safe LLM caller.
    Always returns plain stripped text.
    Never returns JSON.
    """
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ])

    return response.content.strip()


# ---------------------------------------------------
# 1️⃣ SUMMARY ENHANCEMENT
# ---------------------------------------------------

def enhance_summary(summary: str) -> str:
    if not summary or len(summary.strip()) < 10:
        return summary

    system_prompt = """
You are a professional resume writer.

Rules:
- Do NOT invent experience.
- Do NOT add fake achievements or metrics.
- Use only provided information.
- Keep it concise (3–4 sentences).
- Professional tone.
"""

    user_prompt = f"""
Rewrite this professional summary:

{summary}
"""

    return _call_llm(system_prompt, user_prompt)


# ---------------------------------------------------
# 2️⃣ EXPERIENCE BULLET IMPROVEMENT
# ---------------------------------------------------

def enhance_experience(role: str, company: str, bullets: List[str]) -> List[str]:
    if not bullets:
        return bullets

    system_prompt = """
You are an expert resume optimizer.

Rules:
- Do NOT invent metrics.
- Do NOT add technologies.
- Do NOT exaggerate.
- Use strong action verbs.
- Keep each bullet under 25 words.
- Preserve original meaning.
"""

    bullet_text = "\n".join(bullets)

    user_prompt = f"""
Improve the following work experience bullet points.

Role: {role}
Company: {company}

Bullets:
{bullet_text}
"""

    improved_text = _call_llm(system_prompt, user_prompt)

    # Split back into bullet list
    improved_bullets = [
        line.strip("• ").strip()
        for line in improved_text.split("\n")
        if line.strip()
    ]

    return improved_bullets


# ---------------------------------------------------
# 3️⃣ HERO TAGLINE GENERATION
# ---------------------------------------------------

def generate_tagline(name: str, skills: List[str]) -> str:
    if not skills:
        return ""

    top_skills = ", ".join(skills[:5])

    system_prompt = """
You generate short professional portfolio taglines.

Rules:
- Max 15 words.
- Pipe-separated format.
- No fake titles.
- No buzzwords spam.
- Professional tone.
"""

    user_prompt = f"""
Create a hero tagline for:

Name: {name}
Skills: {top_skills}
"""

    return _call_llm(system_prompt, user_prompt)


# ---------------------------------------------------
# 4️⃣ PROJECT SHORT DESCRIPTION
# ---------------------------------------------------

def enhance_project(title: str, tech_stack: List[str], description: List[str]) -> str:
    if not description:
        return ""

    techs = ", ".join(tech_stack) if tech_stack else "Not specified"
    full_desc = " ".join(description)

    system_prompt = """
You are a technical product copywriter.

Rules:
- 30–40 words.
- Clear and professional.
- No exaggeration.
- No fake claims.
- Do not invent technologies.
"""

    user_prompt = f"""
Create a short project description.

Project Title: {title}
Tech Stack: {techs}

Full Description:
{full_desc}
"""

    return _call_llm(system_prompt, user_prompt)


# ---------------------------------------------------
# 5️⃣ BULK ENHANCEMENT PIPELINE
# ---------------------------------------------------

def enhance_portfolio_content(cv_data: Dict) -> Dict:
    """
    Enhances summary, experience bullets,
    tagline, and project descriptions.

    DOES NOT modify structure.
    Only modifies text fields.
    """

    enhanced = cv_data.copy()

    # Enhance summary
    enhanced["summary"] = enhance_summary(cv_data.get("summary", ""))

    # Enhance experience bullets
    for exp in enhanced.get("experience", []):
        exp["description"] = enhance_experience(
            exp.get("role", ""),
            exp.get("company", ""),
            exp.get("description", [])
        )

    # Enhance projects
    for proj in enhanced.get("projects", []):
        proj["short_description"] = enhance_project(
            proj.get("title", ""),
            proj.get("tech_stack", []),
            proj.get("description", [])
        )

    # Generate tagline
    enhanced["tagline"] = generate_tagline(
        enhanced.get("name", ""),
        enhanced.get("skills", [])
    )

    return enhanced