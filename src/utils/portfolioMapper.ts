import type { CVData, PortfolioData } from '@/store/portfolioStore';

/**
 * Build portfolioData from cvData when portfolioData is missing (e.g. after refresh with old persisted state).
 * Mirrors backend mapping.py logic.
 */
export function buildPortfolioFromCV(cvData: CVData | null): PortfolioData | null {
  if (!cvData) return null;

  const contact = cvData.contact || {};
  const links = contact.links || [];
  let linkedin = '';
  let github = '';
  let portfolio_link = '';
  for (const link of links) {
    const lower = String(link).toLowerCase();
    if (linkedin === '' && lower.includes('linkedin.com')) linkedin = link;
    else if (github === '' && lower.includes('github.com')) github = link;
    else if (portfolio_link === '') portfolio_link = link;
  }

  const skills = Array.isArray(cvData.skills) ? cvData.skills : [];
  const primary = skills.slice(0, 8);
  const secondary = skills.slice(8);

  const experience = (cvData.experience || []).map((exp) => ({
    role: exp.role || '',
    company: exp.company || '',
    period: exp.duration || '',
    highlights: (exp.description || []).slice(0, 4),
    tech_stack: (exp as { tech_stack?: string[] }).tech_stack || [],
  }));

  const projects = (cvData.projects || []).map((proj) => {
    const desc = proj.description;
    const descList = Array.isArray(desc) ? desc : typeof desc === 'string' ? [desc] : [];
    const tech = (proj as { tech_stack?: string[] }).tech_stack ?? (proj as { technologies?: string[] }).technologies ?? [];
    return {
      title: proj.title || '',
      short_description: descList[0] || '',
      tech_stack: Array.isArray(tech) ? tech : [],
      highlights: descList.slice(0, 3),
    };
  });

  return {
    hero: {
      name: cvData.personal_info?.full_name || cvData.name || '',
      tagline: cvData.summary || cvData.personal_info?.headline || '',
      location: contact.location || cvData.personal_info?.location || '',
    },
    about: { summary: cvData.summary || '' },
    skills_section: { primary_skills: primary, secondary_skills: secondary },
    experience_timeline: experience,
    projects_section: projects,
    contact_section: {
      full_name: cvData.personal_info?.full_name || cvData.name || '',
      headline: cvData.personal_info?.headline || cvData.summary || '',
      email: cvData.personal_info?.email || contact.email || '',
      phone: cvData.personal_info?.phone || contact.phone || '',
      location: contact.location || cvData.personal_info?.location || '',
      linkedin,
      github,
      portfolio: portfolio_link,
    },
  };
}
