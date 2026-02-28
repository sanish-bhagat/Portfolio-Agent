import { PortfolioData } from '@/types/portfolio';
import { MapPin, Mail, Github, Linkedin, Phone, Globe, Terminal, ArrowDown } from 'lucide-react';

interface Props {
  portfolioData: PortfolioData;
}

const DarkPortfolio = ({ portfolioData }: Props) => {
  const { hero, about, skills_section, experience_timeline, projects_section, contact_section } = portfolioData;
  const allSkills = [...(skills_section.primary_skills || []), ...(skills_section.secondary_skills || [])];

  return (
    <div className="min-h-screen bg-dark-theme-bg text-dark-theme-fg font-space">
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center relative">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, hsl(var(--dark-accent)), transparent 70%)' }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-dark-theme-accent text-sm font-mono-jet mb-8 px-4 py-2 rounded-full border border-dark-theme-border bg-dark-theme-card">
            <Terminal className="w-3.5 h-3.5" />
            <span>available for hire</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Hi, I'm <span className="dark-gradient-text">{hero.name || 'there'}</span>
          </h1>
          <p className="text-lg md:text-xl text-dark-theme-muted-fg max-w-2xl mx-auto mb-4 leading-relaxed">{hero.tagline}</p>
          {hero.location && (
            <p className="inline-flex items-center gap-1.5 text-sm text-dark-theme-muted-fg mb-10">
              <MapPin className="w-3.5 h-3.5" />
              {hero.location}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#projects"
              className="bg-dark-theme-accent text-dark-theme-accent-fg px-8 py-3.5 rounded-lg font-semibold text-base hover:brightness-110 transition-all dark-glow"
            >
              View My Work
            </a>
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-lg font-semibold text-base border border-dark-theme-border text-dark-theme-fg hover:border-dark-theme-accent hover:text-dark-theme-accent transition-all"
            >
              Contact Me
            </a>
          </div>
        </div>
        <a href="#about" className="absolute bottom-10 animate-bounce text-dark-theme-muted-fg">
          <ArrowDown className="w-5 h-5" />
        </a>
      </section>

      <section id="about" className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm uppercase tracking-[0.2em] text-dark-theme-accent font-mono-jet mb-8">// About Me</h2>
          <p className="text-lg text-dark-theme-muted-fg leading-relaxed">{about.summary}</p>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6 bg-dark-theme-card">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm uppercase tracking-[0.2em] text-dark-theme-accent font-mono-jet mb-10">// Skills</h2>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-md bg-dark-theme-tag-bg text-dark-theme-tag-fg text-sm font-medium border border-dark-theme-accent/20"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm uppercase tracking-[0.2em] text-dark-theme-accent font-mono-jet mb-10">// Experience</h2>
          <div className="relative pl-8 border-l border-dark-theme-border space-y-12">
            {experience_timeline.map((exp, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[calc(2rem+4px)] top-2 w-2 h-2 rounded-full bg-dark-theme-accent" />
                <p className="text-xs text-dark-theme-muted-fg font-mono-jet mb-1">{exp.period}</p>
                <h3 className="text-xl font-semibold text-dark-theme-fg">{exp.role}</h3>
                <p className="text-dark-theme-accent text-sm font-medium mb-3">{exp.company}</p>
                <ul className="space-y-1.5 mb-3">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="text-sm text-dark-theme-muted-fg flex gap-2">
                      <span className="text-dark-theme-accent mt-0.5 shrink-0">▹</span>
                      {h}
                    </li>
                  ))}
                </ul>
                {exp.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tech_stack.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-dark-theme-tag-bg text-dark-theme-tag-fg font-mono-jet">
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

      <section id="projects" className="py-20 md:py-28 px-6 bg-dark-theme-card">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm uppercase tracking-[0.2em] text-dark-theme-accent font-mono-jet mb-10">// Projects</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {projects_section.map((proj, i) => (
              <div
                key={i}
                className="bg-dark-theme-bg rounded-xl p-6 border border-dark-theme-border hover:border-dark-theme-accent/40 transition-all group"
              >
                <h3 className="text-xl font-semibold text-dark-theme-fg mb-2 group-hover:text-dark-theme-accent transition-colors">
                  {proj.title}
                </h3>
                <p className="text-sm text-dark-theme-muted-fg mb-4 leading-relaxed">{proj.short_description}</p>
                {proj.highlights.length > 0 && (
                  <ul className="mb-4 space-y-1">
                    {proj.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-dark-theme-muted-fg flex gap-1.5">
                        <span className="text-dark-theme-accent">▹</span> {h}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {proj.tech_stack.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded bg-dark-theme-tag-bg text-dark-theme-tag-fg font-mono-jet">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-sm uppercase tracking-[0.2em] text-dark-theme-accent font-mono-jet mb-8">// Get In Touch</h2>
          <p className="text-lg text-dark-theme-muted-fg mb-8">
            Interested in working together? Let's connect and build something great.
          </p>
          <a
            href={`mailto:${contact_section.email}`}
            className="inline-flex items-center gap-2 bg-dark-theme-accent text-dark-theme-accent-fg px-8 py-4 rounded-lg font-semibold text-lg hover:brightness-110 transition-all dark-glow mb-8"
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
                className="p-3 rounded-lg bg-dark-theme-card text-dark-theme-muted-fg hover:text-dark-theme-accent border border-dark-theme-border hover:border-dark-theme-accent/40 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {contact_section.github && (
              <a
                href={contact_section.github}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg bg-dark-theme-card text-dark-theme-muted-fg hover:text-dark-theme-accent border border-dark-theme-border hover:border-dark-theme-accent/40 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {contact_section.portfolio && (
              <a
                href={contact_section.portfolio}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg bg-dark-theme-card text-dark-theme-muted-fg hover:text-dark-theme-accent border border-dark-theme-border hover:border-dark-theme-accent/40 transition-all"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            {contact_section.phone && (
              <a
                href={`tel:${contact_section.phone}`}
                className="p-3 rounded-lg bg-dark-theme-card text-dark-theme-muted-fg hover:text-dark-theme-accent border border-dark-theme-border hover:border-dark-theme-accent/40 transition-all"
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-dark-theme-muted-fg border-t border-dark-theme-border font-mono-jet">
        © {new Date().getFullYear()} {hero.name || 'Portfolio'} — built with ♥
      </footer>
    </div>
  );
};

export default DarkPortfolio;
