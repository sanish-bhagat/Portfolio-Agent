def map_to_portfolio(cleaned_json: dict) -> dict:
    portfolio = {}

    # HERO
    portfolio["hero"] = {
        "name": cleaned_json.get("name", ""),
        "tagline": cleaned_json.get("summary", ""),
        "location": cleaned_json.get("contact", {}).get("location", "")
    }

    # ABOUT
    portfolio["about"] = {
        "summary": cleaned_json.get("summary", "")
    }

    # SKILLS
    skills = cleaned_json.get("skills", [])

    portfolio["skills_section"] = {
        "primary_skills": skills[:8],
        "secondary_skills": skills[8:]
    }

    # EXPERIENCE
    experience_timeline = []
    for exp in cleaned_json.get("experience", []):
        period = f"{exp.get('start_date', '')} - {exp.get('end_date', '')}"

        experience_timeline.append({
            "role": exp.get("role", ""),
            "company": exp.get("company", ""),
            "period": period.strip(),
            "highlights": exp.get("description", [])[:4],
            "tech_stack": exp.get("tech_stack", [])
        })

    portfolio["experience_timeline"] = experience_timeline

    # PROJECTS
    projects_section = []
    for proj in cleaned_json.get("projects", []):
        short_desc = proj.get("description", [])
        short_desc = short_desc[0] if short_desc else ""

        projects_section.append({
            "title": proj.get("title", ""),
            "short_description": short_desc,
            "tech_stack": proj.get("tech_stack", []),
            "highlights": proj.get("description", [])[:3]
        })

    portfolio["projects_section"] = projects_section

    # CONTACT
    contact = cleaned_json.get("contact", {}) or {}
    links = contact.get("links", []) or []

    linkedin = ""
    github = ""
    portfolio_link = ""

    def normalize_url(url: str) -> str:
        if not url:
            return ""
        url = url.strip()
        if not (url.startswith("http://") or url.startswith("https://") or url.startswith("mailto:")):
            return "https://" + url
        return url

    for link in links:
        lower = str(link).lower()
        if "linkedin.com" in lower and not linkedin:
            linkedin = normalize_url(link)
        elif "github.com" in lower and not github:
            github = normalize_url(link)
        elif not portfolio_link:
            portfolio_link = normalize_url(link)

    # Clean location string from redundant info
    location = contact.get("location", "") or ""
    if "|" in location:
        # Split by | and take the first part which is usually the actual location
        location = location.split("|")[0].strip()

    portfolio["contact_section"] = {
        # Aligns with PersonalInfo / template contact schema
        "full_name": cleaned_json.get("name", ""),
        "headline": cleaned_json.get("summary", ""),
        "email": contact.get("email", ""),
        "phone": contact.get("phone", ""),
        "location": location,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio_link,
    }

    return portfolio