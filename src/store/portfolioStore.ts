import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for CV data (Aligned with Agent Tool instructions)
export interface PersonalInfo {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface Skills {
  technical: string[];
  tools: string[];
  soft: string[];
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  duration: string;
  description: string[];
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  duration: string;
}

export interface CVData {
  personal_info: PersonalInfo;
  summary: string;
  skills: Skills;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: string[];
  achievements: string[];
}

// Types for website configuration
export type ThemeType = 'modern' | 'minimal' | 'dark';

export interface SectionConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

export interface WebsiteConfig {
  theme: ThemeType;
  sections: SectionConfig[];
  customDomain?: string;
}

// Types for deployment
export type DeploymentPlatform = 'vercel' | 'netlify';
export type DeploymentStatus = 'idle' | 'deploying' | 'success' | 'error';

export interface DeploymentState {
  platform: DeploymentPlatform;
  status: DeploymentStatus;
  url?: string;
  error?: string;
}

// Current step in the flow
export type BuilderStep = 'landing' | 'upload' | 'review' | 'preview' | 'deploy';

// Main store interface
interface PortfolioStore {
  // Current step
  currentStep: BuilderStep;
  setCurrentStep: (step: BuilderStep) => void;

  // User ID from backend
  userId: string | null;
  setUserId: (id: string) => void;

  // CV Data
  cvData: CVData | null;
  setCVData: (data: CVData) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  updateSkills: (skills: Skills) => void;
  updateExperience: (experience: Experience[]) => void;
  updateProjects: (projects: Project[]) => void;
  updateEducation: (education: Education[]) => void;
  updateCertifications: (certifications: string[]) => void;
  updateAchievements: (achievements: string[]) => void;

  // Website Config
  websiteConfig: WebsiteConfig;
  setTheme: (theme: ThemeType) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (sections: SectionConfig[]) => void;

  // Deployment
  deployment: DeploymentState;
  setDeploymentPlatform: (platform: DeploymentPlatform) => void;
  setDeploymentStatus: (status: DeploymentStatus, url?: string, error?: string) => void;

  // Upload state
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  isExtracting: boolean;
  setIsExtracting: (extracting: boolean) => void;

  // Reset
  reset: () => void;
}

const defaultSections: SectionConfig[] = [
  { id: 'hero', name: 'Hero', visible: true, order: 0 },
  { id: 'about', name: 'About', visible: true, order: 1 },
  { id: 'skills', name: 'Skills', visible: true, order: 2 },
  { id: 'experience', name: 'Experience', visible: true, order: 3 },
  { id: 'projects', name: 'Projects', visible: true, order: 4 },
  { id: 'education', name: 'Education', visible: true, order: 5 },
  { id: 'contact', name: 'Contact', visible: true, order: 6 },
];

const initialState = {
  currentStep: 'landing' as BuilderStep,
  userId: null,
  cvData: null,
  websiteConfig: {
    theme: 'modern' as ThemeType,
    sections: defaultSections,
  },
  deployment: {
    platform: 'vercel' as DeploymentPlatform,
    status: 'idle' as DeploymentStatus,
  },
  uploadedFile: null,
  isExtracting: false,
};

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      setUserId: (id) => set({ userId: id }),

      setCVData: (data) => set({ cvData: data }),

      updatePersonalInfo: (info) => {
        const current = get().cvData;
        if (current) {
          set({
            cvData: {
              ...current,
              personal_info: { ...current.personal_info, ...info },
            },
          });
        }
      },

      updateSummary: (summary) => {
        const current = get().cvData;
        if (current) {
          set({ cvData: { ...current, summary } });
        }
      },

      updateSkills: (skills) => {
        const current = get().cvData;
        if (current) {
          set({ cvData: { ...current, skills } });
        }
      },

      updateExperience: (experience) => {
        const current = get().cvData;
        if (current) {
          set({ cvData: { ...current, experience } });
        }
      },

      updateProjects: (projects) => {
        const current = get().cvData;
        if (current) {
          set({ cvData: { ...current, projects } });
        }
      },

      updateEducation: (education) => {
        const current = get().cvData;
        if (current) {
          set({ cvData: { ...current, education } });
        }
      },

      updateCertifications: (certifications) => {
        const current = get().cvData;
        if (current) {
          set({ cvData: { ...current, certifications } });
        }
      },

      updateAchievements: (achievements) => {
        const current = get().cvData;
        if (current) {
          set({ cvData: { ...current, achievements } });
        }
      },

      setTheme: (theme) =>
        set((state) => ({
          websiteConfig: { ...state.websiteConfig, theme },
        })),

      toggleSectionVisibility: (sectionId) =>
        set((state) => ({
          websiteConfig: {
            ...state.websiteConfig,
            sections: state.websiteConfig.sections.map((section) =>
              section.id === sectionId
                ? { ...section, visible: !section.visible }
                : section
            ),
          },
        })),

      reorderSections: (sections) =>
        set((state) => ({
          websiteConfig: { ...state.websiteConfig, sections },
        })),

      setDeploymentPlatform: (platform) =>
        set((state) => ({
          deployment: { ...state.deployment, platform },
        })),

      setDeploymentStatus: (status, url, error) =>
        set((state) => ({
          deployment: { ...state.deployment, status, url, error },
        })),

      setUploadedFile: (file) => set({ uploadedFile: file }),

      setIsExtracting: (extracting) => set({ isExtracting: extracting }),

      reset: () => set(initialState),
    }),
    {
      name: 'portfolio-builder-storage',
      partialize: (state) => ({
        userId: state.userId,
        cvData: state.cvData,
        websiteConfig: state.websiteConfig,
        currentStep: state.currentStep,
      }),
    }
  )
);
