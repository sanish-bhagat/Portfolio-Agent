import { PortfolioData } from "@/types/portfolio";

export const samplePortfolioData: PortfolioData = {
  hero: {
    name: "Alex Rivera",
    tagline: "Full-Stack Engineer crafting elegant digital experiences",
    location: "San Francisco, CA",
  },
  about: {
    summary:
      "I'm a passionate full-stack engineer with 6+ years of experience building scalable web applications. I thrive at the intersection of design and engineering, turning complex problems into intuitive user experiences. When I'm not coding, you'll find me exploring hiking trails or experimenting with generative art.",
  },
  skills_section: {
    primary_skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "PostgreSQL",
      "AWS",
      "GraphQL",
      "Docker",
    ],
    secondary_skills: [
      "Figma",
      "Redis",
      "Terraform",
      "CI/CD",
      "MongoDB",
      "Tailwind CSS",
      "Next.js",
      "Prisma",
    ],
  },
  experience_timeline: [
    {
      role: "Senior Frontend Engineer",
      company: "Streamline Inc.",
      period: "Mar 2023 – Present",
      highlights: [
        "Led migration of legacy Angular app to React, reducing bundle size by 40%",
        "Designed component library adopted by 5 product teams",
        "Mentored 3 junior engineers through structured onboarding program",
      ],
      tech_stack: ["React", "TypeScript", "GraphQL", "Storybook"],
    },
    {
      role: "Full-Stack Developer",
      company: "NovaTech Solutions",
      period: "Jun 2020 – Feb 2023",
      highlights: [
        "Built real-time analytics dashboard serving 50k+ daily users",
        "Implemented microservices architecture improving deployment velocity by 3×",
        "Reduced API response times by 60% through caching strategies",
      ],
      tech_stack: ["Node.js", "React", "PostgreSQL", "Redis", "Docker"],
    },
    {
      role: "Junior Developer",
      company: "PixelCraft Studio",
      period: "Aug 2018 – May 2020",
      highlights: [
        "Developed responsive e-commerce platform generating $2M+ annual revenue",
        "Integrated payment gateways (Stripe, PayPal) with 99.9% uptime",
      ],
      tech_stack: ["JavaScript", "Python", "Django", "MySQL"],
    },
  ],
  projects_section: [
    {
      title: "DevFlow",
      short_description:
        "An open-source developer productivity tool that visualizes Git workflows and automates PR reviews using AI.",
      tech_stack: ["React", "TypeScript", "OpenAI API", "Supabase"],
      highlights: [
        "1.2k GitHub stars in first 3 months",
        "Featured on Hacker News front page",
      ],
    },
    {
      title: "Pulse Analytics",
      short_description:
        "Real-time web analytics dashboard with privacy-first tracking, built as a lightweight alternative to Google Analytics.",
      tech_stack: ["Next.js", "ClickHouse", "Tailwind CSS", "Vercel"],
      highlights: [
        "Handles 10M+ events/day",
        "Sub-50ms query response times",
      ],
    },
    {
      title: "Artisan Market",
      short_description:
        "Marketplace connecting local artisans with buyers, featuring live auctions and secure escrow payments.",
      tech_stack: ["React Native", "Node.js", "Stripe", "MongoDB"],
      highlights: [
        "500+ active sellers onboarded",
        "4.8★ App Store rating",
      ],
    },
    {
      title: "CloudSketch",
      short_description:
        "Collaborative whiteboard tool with real-time sync, infinite canvas, and AI-powered shape recognition.",
      tech_stack: ["Canvas API", "WebSockets", "Go", "Redis"],
      highlights: [
        "Real-time collaboration for up to 50 users",
        "Used by 3 design agencies",
      ],
    },
  ],
  contact_section: {
    full_name: "Alex Rivera",
    headline: "Open to new opportunities",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/alexrivera",
    github: "https://github.com/alexrivera",
    portfolio: "https://alexrivera.dev",
  },
};
