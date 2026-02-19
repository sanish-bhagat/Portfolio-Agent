import argparse
from io import BytesIO
import re
import pdfplumber
import requests
import spacy
import json

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


TECH_SKILL_DATABASE = load_json(r"C:\Users\Sanish Bhagat\project\Portfolio-Agent\backend\data\skills\skills_master.json")


REQUEST_HEADERS = {
    "User-Agent": "resume-parser/1.0"
}

def extract_text_from_pdf(url):
    try:
        response = requests.get(url, timeout=20, headers=REQUEST_HEADERS)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Warning: failed to fetch {url}: {e}")
        return ""
    
    try:
        text = ""
        with pdfplumber.open(BytesIO(response.content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Warning: failed to parse PDF from {url}: {e}")
        return ""


nlp = spacy.load("en_core_web_lg")

def extract_name(text):
    """
    Extract candidate PERSON entities from top of resume.
    """
    doc = nlp(text[:1000])  # only analyze first part for speed

    persons = [
        ent.text.strip()
        for ent in doc.ents
        if ent.label_ == "PERSON"
    ]

    # Filter short/noisy entities
    persons = [
        p for p in persons
        if 2 <= len(p.split()) <= 4
    ]

    return persons[0] if persons else ""



def extract_contact_details(text):
    email = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    phone = re.findall(r"\+?\d[\d\-\s]{8,}\d", text)

    links = re.findall(r"https?://[^\s]+", text)

    # LinkedIn / GitHub detection
    for line in text.split("\n"):
        if "linkedin.com" in line.lower():
            links.append(line.strip())
        if "github.com" in line.lower():
            links.append(line.strip())

    # Basic location heuristic
    location = ""
    for line in text.split("\n")[:15]:
        if "," in line and any(c.isalpha() for c in line):
            location = line.strip()
            break

    return {
        "email": email[0] if email else "",
        "phone": phone[0] if phone else "",
        "links": list(set(links)),
        "location": location
    }

COMMON_SKILLS = [
    "Python", "Java", "C++", "JavaScript", "React", "Node.js",
    "MongoDB", "MySQL", "PostgreSQL", "Docker", "AWS",
    "Machine Learning", "Deep Learning", "TensorFlow",
    "Flask", "Django", "REST", "Git", "Linux"
]


def extract_skills(text):
    """
    Extract all skills mentioned in CV.
    Priority:
    1. Skills section extraction
    2. Pattern-based extraction (comma / bullet separated lists)
    3. Fallback keyword search
    """

    
def extract_skills(text):
    text_lower = text.lower()
    found_skills = set()

    for category in TECH_SKILL_DATABASE.values():
        for skill in category:
            if skill.lower() in text_lower:
                found_skills.add(skill)

    return sorted(list(found_skills))


def extract_education(text):
    lines = text.split("\n")
    education_entries = []

    degree_keywords = [
        "bachelor", "master", "b.tech", "m.tech",
        "bsc", "msc", "phd", "diploma"
    ]

    for i, line in enumerate(lines):
        lower = line.lower()
        if any(deg in lower for deg in degree_keywords):
            entry = {
                "degree": line.strip(),
                "institution": "",
                "year": ""
            }

            # Look at next line for institution
            if i + 1 < len(lines):
                entry["institution"] = lines[i + 1].strip()

            # Extract year
            year_match = re.search(r"(19|20)\d{2}", line)
            if year_match:
                entry["year"] = year_match.group()

            education_entries.append(entry)

    return education_entries


def extract_certifications(text):
    lines = text.split("\n")
    certs = []

    for line in lines:
        if "certification" in line.lower() or "certified" in line.lower():
            certs.append(line.strip())

    return certs


def extract_summary(text):
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if "summary" in line.lower() or "profile" in line.lower():
            return lines[i+1] if i+1 < len(lines) else ""
    return ""



def fix_broken_words(text):
    """Enhanced word-wrap fixing"""
    # Join words split by hyphen line-wrap: "Tech-\nnical" -> "Technical"
    text = re.sub(r"(\b[A-Za-z]{2,})-\n([A-Za-z]{2,}\b)", r"\1\2", text)
    
    # Join likely mid-word splits: "contai\nnerized" -> "containerized"
    text = re.sub(r"(\b[A-Za-z]{2,12})\n([a-z]{2,}\b)", r"\1\2", text)
    
    # Fix words broken without hyphen when lowercase continues: "consistently\nturning"
    text = re.sub(r"([a-z])\n([a-z])", r"\1 \2", text)
    
    return text


def normalize_text(text):
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"\n+", "\n", text)
    return text


def is_section_header(line):
    """
    Detect if a line is a major section header (Education, Experience, Projects, etc.)
    Returns the section type or None
    """
    clean = line.lower().strip().rstrip(':').rstrip('.')
    words = clean.split()
    
    # Headers should be short
    if len(words) > 5:
        return None
    
    # Must look like a header
    if not (line.isupper() or line.istitle() or line.endswith(':') or 
            (len(words) <= 2 and all(w[0].isupper() for w in words if w))):
        return None
    
    # Experience variations
    if any(kw in clean for kw in ['experience', 'employment', 'work history', 'internship']):
        return 'EXPERIENCE'
    
    # Projects variations  
    if any(kw in clean for kw in ['project']):
        return 'PROJECTS'
    
    # Other sections to stop at
    other_sections = [
        'education', 'skill', 'certification', 'award', 'honor',
        'achievement', 'publication', 'activity', 'leadership',
        'volunteer', 'interest', 'language', 'reference', 'summary',
        'objective', 'profile', 'coursework'
    ]
    if any(kw in clean for kw in other_sections):
        return 'OTHER'
    
    return None


def is_work_role(line):
    """Detect if line contains actual work roles (not extracurricular)"""
    lower = line.lower()
    
    work_titles = [
        'intern', 'developer', 'engineer', 'analyst', 'consultant',
        'trainee', 'programmer', 'architect', 'manager', 'lead',
        'specialist', 'coordinator', 'associate', 'scientist'
    ]
    
    exclude_roles = [
        'president', 'vice president', 'secretary', 'treasurer',
        'captain', 'head', 'coordinator', 'member', 'volunteer',
        'club', 'society', 'team'
    ]
    
    has_work = any(title in lower for title in work_titles)
    has_exclude = any(role in lower for role in exclude_roles)
    
    return has_work and not has_exclude


def extract_sections_with_content(text):
    """
    Extract sections while preserving complete multi-line entries.
    Returns dictionary with section names as keys and lists of lines as values.
    """
    text = normalize_text(text)
    lines = text.split("\n")
    
    sections = {
        "EXPERIENCE": [],
        "PROJECTS": [],
    }
    
    current_section = None
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Check if this is a section header
        section_type = is_section_header(stripped)
        
        if section_type == 'EXPERIENCE':
            current_section = 'EXPERIENCE'
            continue
        elif section_type == 'PROJECTS':
            current_section = 'PROJECTS'
            continue
        elif section_type == 'OTHER':
            current_section = None
            continue
        
        # Add line to current section
        if current_section:
            sections[current_section].append(stripped)
    
    return sections


def structure_experience(lines):
    """
    Convert cleaned experience lines into structured objects.
    """
    experiences = []
    i = 0

    while i < len(lines):
        line = lines[i]

        if is_work_role(line):
            job = {
                "role": line,
                "company": "",
                "location": "",
                "duration": "",
                "description": []
            }

            i += 1

            # Capture company/location/date line
            if i < len(lines):
                possible_meta = lines[i]

                # Duration pattern (basic)
                if re.search(r"\b(20\d{2}|19\d{2})\b", possible_meta):
                    job["duration"] = possible_meta
                else:
                    job["company"] = possible_meta

                i += 1

            # Capture bullet points
            while i < len(lines):
                if is_work_role(lines[i]):
                    break

                job["description"].append(lines[i])
                i += 1

            experiences.append(job)
        else:
            i += 1

    return experiences


def structure_projects(lines):
    projects = []
    i = 0

    while i < len(lines):
        title = lines[i]
        project = {
            "title": title,
            "description": []
        }

        i += 1

        while i < len(lines):
            if len(lines[i]) < 5 or lines[i].istitle():
                break

            project["description"].append(lines[i])
            i += 1

        projects.append(project)

    return projects



def parse_cv_from_url(url):
    text = extract_text_from_pdf(url)
    if not text:
        return {}

    text = fix_broken_words(text)
    sections = extract_sections_with_content(text)

    structured_experience_data = structure_experience(sections["EXPERIENCE"])

    return {
        "name": extract_name(text),
        "contact": extract_contact_details(text),
        "summary": extract_summary(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": structured_experience_data,
        "projects": structure_projects(sections["PROJECTS"]),
        "certifications": extract_certifications(text)
    }



if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract experience and projects from a resume PDF URL."
    )
    parser.add_argument(
        "--url",
        default="https://res.cloudinary.com/dw7o7z8ib/raw/upload/v1770698080/y4ragclyuetlbcakfqe1.PDF",
        help="Public PDF URL to parse.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Show raw extracted text for debugging"
    )
    
    args = parser.parse_args()
    
    if args.debug:
        text = extract_text_from_pdf(args.url)
        text = fix_broken_words(text)
        print("\n========= RAW TEXT (first 2000 chars) =========\n")
        print(text[:2000])
        print("\n" + "="*50 + "\n")
    
    result = parse_cv_from_url(args.url)
    
    for key, value in result.items():
        print(f"\n========= {key.upper()} =========\n")
        print(value)