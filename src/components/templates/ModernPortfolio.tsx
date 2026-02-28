import { PortfolioData } from '@/types/portfolio';
import { MapPin, Mail, Github, Linkedin, ArrowDown, Phone, Globe } from 'lucide-react';

interface Props {
  portfolioData: PortfolioData;
}

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-3xl md:text-4xl font-space font-bold text-modern-fg mb-2">{children}</h2>
);

const Tag = ({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' }) => (
  <span
    className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium transition-transform hover:scale-105 ${
      variant === 'primary' ? 'bg-modern-tag-bg text-modern-tag-fg' : 'bg-modern-tag-secondary-bg text-modern-tag-secondary-fg'
    }`}
  >
    {children}
  </span>
);

const ModernPortfolio = ({ portfolioData }: Props) => {
  const { hero, about, skills_section, experience_timeline, projects_section, contact_section } = portfolioData;
  const allSkills = [...(skills_section.primary_skills || []), ...(skills_section.secondary_skills || [])];

  return (
    <div className="min-h-screen bg-modern-bg font-inter">
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--modern-fg)) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          {hero.location && (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-modern-card text-modern-muted-fg text-sm mb-8 shadow-sm">
              <MapPin className="w-3.5 h-3.5" />
              {hero.location}
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-space font-bold text-modern-fg mb-6 leading-tight">
            Hi, I'm <span className="modern-gradient-text">{hero.name || 'there'}</span>
          </h1>
          <p className="text-lg md:text-xl text-modern-muted-fg max-w-2xl mx-auto mb-10 leading-relaxed">{hero.tagline}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#projects"
              className="modern-gradient-bg text-modern-accent-fg px-8 py-3.5 rounded-full font-semibold text-base shadow-lg shadow-modern-accent/25 hover:shadow-xl hover:shadow-modern-accent/30 transition-all hover:-translate-y-0.5"
            >
              View My Work
            </a>
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-full font-semibold text-base border-2 border-modern-muted text-modern-fg hover:border-modern-accent hover:text-modern-accent transition-all"
            >
              Contact Me
            </a>
          </div>
        </div>
        <a href="#about" className="absolute bottom-10 animate-bounce text-modern-muted-fg">
          <ArrowDown className="w-5 h-5" />
        </a>
      </section>

      <section id="about" className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionHeading>About Me</SectionHeading>
          <div className="h-1 w-16 modern-gradient-bg rounded-full mb-8" />
          <p className="text-lg text-modern-muted-fg leading-relaxed">{about.summary}</p>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6 bg-modern-card">
        <div className="max-w-3xl mx-auto">
          <SectionHeading>Skills</SectionHeading>
          <div className="h-1 w-16 modern-gradient-bg rounded-full mb-10" />
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionHeading>Experience</SectionHeading>
          <div className="h-1 w-16 modern-gradient-bg rounded-full mb-10" />
          <div className="relative pl-8 border-l-2 border-modern-muted space-y-12">
            {experience_timeline.map((exp, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[calc(2rem+5px)] top-1.5 w-3 h-3 rounded-full modern-gradient-bg ring-4 ring-modern-bg" />
                <p className="text-sm text-modern-muted-fg font-mono-jet mb-1">{exp.period}</p>
                <h3 className="text-xl font-space font-semibold text-modern-fg">{exp.role}</h3>
                <p className="text-modern-accent font-medium mb-3">{exp.company}</p>
                <ul className="space-y-1.5 mb-3">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="text-modern-muted-fg text-sm flex gap-2">
                      <span className="text-modern-accent mt-1.5 shrink-0">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
                {exp.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tech_stack.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-modern-tag-bg text-modern-tag-fg">
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

      <section id="projects" className="py-20 md:py-28 px-6 bg-modern-card">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <SectionHeading>Projects</SectionHeading>
            <div className="h-1 w-16 modern-gradient-bg rounded-full mb-10" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {projects_section.map((proj, i) => (
              <div key={i} className="bg-modern-bg rounded-2xl p-6 modern-card-hover border border-modern-muted/50">
                <h3 className="text-xl font-space font-semibold text-modern-fg mb-2">{proj.title}</h3>
                <p className="text-modern-muted-fg text-sm mb-4 leading-relaxed">{proj.short_description}</p>
                {proj.highlights.length > 0 && (
                  <ul className="mb-4 space-y-1">
                    {proj.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-modern-muted-fg flex gap-1.5">
                        <span className="text-modern-accent">✦</span> {h}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {proj.tech_stack.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading>Get In Touch</SectionHeading>
          <div className="h-1 w-16 modern-gradient-bg rounded-full mb-8 mx-auto" />
          <p className="text-modern-muted-fg mb-8 text-lg">
            I'm always open to new opportunities and interesting conversations. Don't hesitate to reach out!
          </p>
          <a
            href={`mailto:${contact_section.email}`}
            className="inline-flex items-center gap-2 modern-gradient-bg text-modern-accent-fg px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-modern-accent/25 hover:shadow-xl hover:shadow-modern-accent/30 transition-all hover:-translate-y-0.5 mb-8"
          >
            <Mail className="w-5 h-5" />
            {contact_section.email}
          </a>
          <div className="flex justify-center gap-4 mt-2">
            {contact_section.linkedin && (
              <a
                href={contact_section.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-modern-card text-modern-muted-fg hover:text-modern-accent transition-colors shadow-sm"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {contact_section.github && (
              <a
                href={contact_section.github}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-modern-card text-modern-muted-fg hover:text-modern-accent transition-colors shadow-sm"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {contact_section.portfolio && (
              <a
                href={contact_section.portfolio}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-modern-card text-modern-muted-fg hover:text-modern-accent transition-colors shadow-sm"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            {contact_section.phone && (
              <a href={`tel:${contact_section.phone}`} className="p-3 rounded-full bg-modern-card text-modern-muted-fg hover:text-modern-accent transition-colors shadow-sm">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-modern-muted-fg border-t border-modern-muted">
        © {new Date().getFullYear()} {hero.name || 'Portfolio'}. All rights reserved.
      </footer>
    </div>
  );
};

export default ModernPortfolio;
