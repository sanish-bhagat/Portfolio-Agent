import argparse
from io import BytesIO
import re
import pdfplumber
import requests
import spacy
import json
from collections import Counter

nlp = spacy.load("en_core_web_sm")

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


# def extract_name(text):
#     lines = text.split("\n")[:10]  # Only first 10 lines
#     top_text = "\n".join(lines)

#     doc = nlp(top_text)

#     for ent in doc.ents:
#         if ent.label_ == "PERSON":
#             candidate = ent.text.strip()

#             # Reject lines that look like location
#             if "," in candidate:
#                 continue

#             if 2 <= len(candidate.split()) <= 4:
#                 return candidate

#     return ""

def extract_name(text):
    lines = text.split("\n")[:8]

    for line in lines:
        clean = line.strip()

        # Skip empty
        if not clean:
            continue

        # Reject lines containing email, numbers, comma (likely location)
        if "@" in clean or any(char.isdigit() for char in clean) or "," in clean:
            continue

        words = clean.split()

        # Likely full name: 2–4 capitalized words
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w[0].isalpha()):
            return clean

    return ""



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
    text_lower = text.lower()
    found_skills = set()

    for category in TECH_SKILL_DATABASE.values():
        for skill in category:
            pattern = rf"\b{re.escape(skill.lower())}\b"
            if re.search(pattern, text_lower):
                found_skills.add(skill)

    return sorted(found_skills)



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
                next_line = lines[i + 1].strip()
                if not next_line.startswith("CGPA") and not next_line.startswith("GPA"):
                    entry["institution"] = next_line

            # Extract year
            year_match = re.search(r"(19|20)\d{2}", line)
            if year_match:
                entry["year"] = year_match.group()
                # Remove year from degree line if found
                cleaned_degree = re.sub(r"[\s\-–,]*" + year_match.group() + r"[\s\-–,]*.*", "", entry["degree"]).strip()
                # Remove trailing months
                cleaned_degree = re.sub(r"[\s,]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?$", "", cleaned_degree, flags=re.IGNORECASE).strip()
                entry["degree"] = cleaned_degree

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
    
    # Ignore lines starting with bullet points or dashes
    if re.match(r'^[\s]*[•\-\*]', line):
        return False
    
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
    experiences = []
    current_job = None

    for line in lines:
        line = line.strip()

        # New role
        if is_work_role(line):
            if current_job:
                experiences.append(current_job)

            start_date = ""
            end_date = ""
            role_clean = line.strip()

            # Extract duration from role line
            duration_match = re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec).*?(19|20)\d{2}", line)
            
            if "–" in line:
                parts = line.split("–")
                start_date = parts[-2].strip() if len(parts) >= 2 else ""
                end_date = parts[-1].strip()
                
                # Role clean needs to remove start date if it was captured in parts[-2]
                # If format is "Role Start - End", parts[-2] is "Role Start"
                # If format is "Role - Start - End", parts[-2] is "Start"
                
                # Refined logic:
                if len(parts) >= 3:
                     # Role - Start - End
                     role_clean = parts[0].strip()
                     start_date = parts[-2].strip()
                else:
                     # Role Start - End
                     # We need to extract Start from parts[0]
                     # Try to match date at end of parts[0]
                     match = re.search(r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{4})$", parts[0].strip(), re.IGNORECASE)
                     if match:
                         start_date = match.group(1)
                         role_clean = parts[0][:match.start()].strip()
                     else:
                         role_clean = parts[0].strip()
            
            current_job = {
                "role": role_clean,
                "company": "",
                "start_date": start_date,
                "end_date": end_date,
                "description": [],
                "tech_stack": []
            }

        elif current_job:

            # Duration detection (fallback if separate line)
            if not current_job["start_date"] and re.search(r"\b(20\d{2}|19\d{2})\b", line):
                current_job["duration"] = line # Keep legacy field or parse?
                # Let's try to parse start/end from this line too
                if "–" in line:
                     parts = line.split("–")
                     current_job["start_date"] = parts[0].strip()
                     current_job["end_date"] = parts[-1].strip()
                elif "-" in line:
                     parts = line.split("-")
                     current_job["start_date"] = parts[0].strip()
                     current_job["end_date"] = parts[-1].strip()

            # Bullet description
            elif line.startswith("•"):
                current_job["description"].append(line)

            # Tech stack detection
            elif "Technologies" in line or "Skills Used" in line:
                if ":" in line:
                    stack = line.split(":", 1)[1]
                    techs = [t.strip() for t in stack.split(",") if t.strip()]
                    current_job["tech_stack"] = techs

            # Company line (only once)
            elif not current_job["company"] and line and line[0].isupper() and not line.startswith("CGPA") and not line.startswith("GPA") \
                and not line.lower().startswith("technologies") and not line.lower().startswith("skills"):
                current_job["company"] = line
            
            # Otherwise, treat as description continuation
            else:
                current_job["description"].append(line)

    if current_job:
        experiences.append(current_job)

    return experiences




def structure_projects(lines):
    projects = []
    current_project = None

    for line in lines:
        if not line.startswith("•") and "Tech Stack" not in line:
            if current_project:
                projects.append(current_project)

            current_project = {
                "title": line.strip(),
                "description": [],
                "tech_stack": []
            }

        else:
            if "Tech Stack:" in line:
                try:
                    stack = line.split(":", 1)[1]
                    techs = [t.strip() for t in stack.split(",")]
                    if current_project:
                        current_project["tech_stack"] = techs
                except IndexError:
                    pass # Malformed tech stack line
            else:
                if current_project:
                    current_project["description"].append(line.strip())

    if current_project:
        projects.append(current_project)

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


def extract_skills_with_frequency(text):
    text_lower = text.lower()
    skill_counts = Counter()

    for category in TECH_SKILL_DATABASE.values():
        for skill in category:
            pattern = rf"\b{re.escape(skill.lower())}\b"
            matches = re.findall(pattern, text_lower)
            if matches:
                skill_counts[skill] = len(matches)

    return dict(skill_counts)




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
    
    # Print as valid JSON for easier parsing/verification
    print(json.dumps(result, indent=2))