export interface PortfolioData {
  hero: {
    name: string;
    tagline: string;
    location: string;
  };
  about: {
    summary: string;
  };
  skills_section: {
    primary_skills: string[];
    secondary_skills: string[];
  };
  experience_timeline: {
    role: string;
    company: string;
    period: string;
    highlights: string[];
    tech_stack: string[];
  }[];
  projects_section: {
    title: string;
    short_description: string;
    tech_stack: string[];
    highlights: string[];
  }[];
  contact_section: {
    full_name?: string;
    headline?: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}
