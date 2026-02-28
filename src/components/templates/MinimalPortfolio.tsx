import { PortfolioData } from '@/types/portfolio';
import { MapPin, Mail, Github, Linkedin, Phone, Globe, ArrowUpRight } from 'lucide-react';

interface Props {
  portfolioData: PortfolioData;
}

const MinimalPortfolio = ({ portfolioData }: Props) => {
  const { hero, about, skills_section, experience_timeline, projects_section, contact_section } = portfolioData;
  const allSkills = [...(skills_section.primary_skills || []), ...(skills_section.secondary_skills || [])];

  return (
    <div className="min-h-screen bg-minimal-bg font-inter text-minimal-fg">
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-12">
        <div className="max-w-[720px] mx-auto w-full">
          <h1 className="text-4xl md:text-6xl font-display font-semibold leading-tight mb-6 tracking-tight">
            {hero.name || 'Portfolio'}
          </h1>
          <p className="text-lg md:text-xl text-minimal-muted-fg leading-relaxed mb-6 max-w-lg">{hero.tagline}</p>
          {hero.location && (
            <p className="inline-flex items-center gap-1.5 text-sm text-minimal-muted-fg mb-10">
              <MapPin className="w-3.5 h-3.5" />
              {hero.location}
            </p>
          )}
          <div className="flex gap-4">
            <a href="#projects" className="bg-minimal-accent text-minimal-accent-fg px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity">
              View My Work
            </a>
            <a href="#contact" className="border border-minimal-border text-minimal-fg px-6 py-3 text-sm font-medium hover:bg-minimal-muted transition-colors">
              Contact Me
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 md:px-12">
        <hr className="border-minimal-border" />
      </div>

      <section id="about" className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] text-minimal-muted-fg mb-8 font-medium">About</h2>
          <p className="text-lg leading-relaxed text-minimal-fg">{about.summary}</p>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 md:px-12">
        <hr className="border-minimal-border" />
      </div>

      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] text-minimal-muted-fg mb-8 font-medium">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => (
              <span key={s} className="px-3 py-1.5 border border-minimal-fg text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 md:px-12">
        <hr className="border-minimal-border" />
      </div>

      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] text-minimal-muted-fg mb-10 font-medium">Experience</h2>
          <div className="space-y-14">
            {experience_timeline.map((exp, i) => (
              <div key={i}>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                  <div>
                    <h3 className="text-lg font-medium">{exp.role}</h3>
                    <p className="text-minimal-muted-fg text-sm">{exp.company}</p>
                  </div>
                  <p className="text-sm text-minimal-muted-fg font-mono-jet shrink-0">{exp.period}</p>
                </div>
                <ul className="space-y-1.5 mb-3">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="text-sm text-minimal-muted-fg pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-minimal-border">
                      {h}
                    </li>
                  ))}
                </ul>
                {exp.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tech_stack.map((t) => (
                      <span key={t} className="text-xs text-minimal-muted-fg bg-minimal-muted px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 md:px-12">
        <hr className="border-minimal-border" />
      </div>

      <section id="projects" className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] text-minimal-muted-fg mb-10 font-medium">Projects</h2>
          <div className="space-y-10">
            {projects_section.map((proj, i) => (
              <div key={i} className="group">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                  {proj.title}
                  <ArrowUpRight className="w-4 h-4 text-minimal-muted-fg opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-minimal-muted-fg mb-3 leading-relaxed">{proj.short_description}</p>
                {proj.highlights.length > 0 && (
                  <ul className="mb-3 space-y-1">
                    {proj.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-minimal-muted-fg pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-minimal-border">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {proj.tech_stack.map((t) => (
                    <span key={t} className="text-xs text-minimal-muted-fg bg-minimal-muted px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 md:px-12">
        <hr className="border-minimal-border" />
      </div>

      <section id="contact" className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] text-minimal-muted-fg mb-8 font-medium">Contact</h2>
          <p className="text-lg mb-8">Let's work together. I'm always open to discussing new projects and ideas.</p>
          <a
            href={`mailto:${contact_section.email}`}
            className="inline-flex items-center gap-2 bg-minimal-accent text-minimal-accent-fg px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity mb-8"
          >
            <Mail className="w-4 h-4" />
            {contact_section.email}
          </a>
          <div className="flex gap-6 text-minimal-muted-fg">
            {contact_section.linkedin && (
              <a href={contact_section.linkedin} target="_blank" rel="noreferrer" className="hover:text-minimal-fg transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {contact_section.github && (
              <a href={contact_section.github} target="_blank" rel="noreferrer" className="hover:text-minimal-fg transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
            {contact_section.portfolio && (
              <a href={contact_section.portfolio} target="_blank" rel="noreferrer" className="hover:text-minimal-fg transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            )}
            {contact_section.phone && (
              <a href={`tel:${contact_section.phone}`} className="hover:text-minimal-fg transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 md:px-12 text-xs text-minimal-muted-fg border-t border-minimal-border">
        <div className="max-w-[720px] mx-auto">© {new Date().getFullYear()} {hero.name || 'Portfolio'}</div>
      </footer>
    </div>
  );
};

export default MinimalPortfolio;
