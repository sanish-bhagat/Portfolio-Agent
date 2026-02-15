import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '@/store/portfolioStore';
import { StepIndicator } from '@/components/StepIndicator';
import { ThemeSelector } from '@/components/ThemeSelector';
import { SectionToggle } from '@/components/SectionToggle';
import { PreviewSkeleton } from '@/components/PreviewSkeleton';
import { DeployModal } from '@/components/DeployModal';
import { EditableBlock } from '@/components/EditableBlock';
import { Button } from '@/components/ui/button';
import { generate_site_tool, preview_site_tool, update_site_tool, store_user_state_tool } from '@/services/agent/tools';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit3, Rocket, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

type EditingSection = {
  id: string;
  type: 'content' | 'style';
} | null;

export default function PreviewPage() {
  const navigate = useNavigate();
  const { 
    cvData, 
    userId,
    websiteConfig, 
    setCurrentStep, 
    updatePersonalInfo, 
    updateSummary, 
    deployment 
  } = usePortfolioStore(
    useShallow((state) => ({
      cvData: state.cvData,
      userId: state.userId,
      websiteConfig: state.websiteConfig,
      setCurrentStep: state.setCurrentStep,
      updatePersonalInfo: state.updatePersonalInfo,
      updateSummary: state.updateSummary,
      deployment: state.deployment,
    }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const initPreview = async () => {
      if (!userId || previewUrl) {
        if (!userId) setIsLoading(false);
        return;
      }
      
      setCurrentStep('preview');
      setIsLoading(true);
      
      try {
        console.log('[PreviewPage] Retrieving site preview...');
        // Tool 4: Site Preview Tool
        const result = await preview_site_tool(userId);
        setPreviewUrl(result.preview_url);
        
        setIsLoading(false);
        console.log('[PreviewPage] Preview retrieved');
      } catch (error) {
        console.error('[PreviewPage] Failed to retrieve preview:', error);
        toast.error('Failed to load preview.');
        setIsLoading(false);
      }
    };
    
    initPreview();
  }, [userId, setCurrentStep, previewUrl]);

  // Sync website config changes to backend
  useEffect(() => {
    const syncConfig = async () => {
      if (!userId || isLoading) return;

      try {
        console.log('[PreviewPage] Syncing config to backend...', websiteConfig);
        await update_site_tool(userId, {
          type: 'config_update',
          config: websiteConfig
        });
        
        // Also persist state
        await store_user_state_tool(userId, {
          cvData,
          websiteConfig,
          deployment,
          currentStep: 'preview'
        });
      } catch (error) {
        console.error('[PreviewPage] Failed to sync config:', error);
      }
    };

    syncConfig();
  }, [websiteConfig, userId, cvData, deployment]); // Re-sync when config or other relevant state changes

  // Redirect if no CV data
  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No CV data found</p>
          <Button onClick={() => navigate('/upload')}>Upload CV</Button>
        </div>
      </div>
    );
  }

  const visibleSections = websiteConfig.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const handleEditSection = (sectionId: string) => {
    setEditingSection({ id: sectionId, type: 'content' });
    
    if (sectionId === 'hero' || sectionId === 'about' || sectionId === 'header') {
      setEditForm({
        full_name: cvData.personal_info?.full_name || '',
        headline: cvData.personal_info?.headline || '',
        summary: cvData.summary || '',
      });
    }
  };

  const handleStyleSection = (sectionId: string) => {
    setEditingSection({ id: sectionId, type: 'style' });
    toast.info(`Style editor for ${sectionId} section - Coming soon!`);
    setEditingSection(null);
  };

  const handleSaveEdit = async () => {
    if (editingSection?.id === 'hero' || editingSection?.id === 'about' || editingSection?.id === 'header') {
      const personalUpdates = {
        full_name: editForm.full_name,
        headline: editForm.headline,
      };
      
      // Update local store
      updatePersonalInfo(personalUpdates);
      updateSummary(editForm.summary);
      
      // Tool 6: Website Update Tool
      if (userId) {
        try {
          await update_site_tool(userId, {
            section_id: editingSection.id,
            content: { ...personalUpdates, summary: editForm.summary }
          });
        } catch (error) {
          console.error('[PreviewPage] Failed to update site:', error);
          toast.error('Failed to sync changes with server.');
        }
      }
      
      // Tool 2: Persistence Tool
      if (userId) {
        await store_user_state_tool(userId, {
          cvData: { ...cvData, personal_info: { ...cvData.personal_info, ...personalUpdates }, summary: editForm.summary },
          websiteConfig,
          deployment,
          currentStep: 'preview'
        });
      }
      
      toast.success('Section updated!');
    }
    setEditingSection(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/review')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold font-display text-foreground">PortfolioAI</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Step Indicator */}
      <div className="relative z-10 py-6">
        <StepIndicator />
      </div>

      {/* Main Content - Split Layout */}
      <main className="relative z-10 container mx-auto px-6 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)]">
          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 rounded-2xl border border-border bg-card overflow-hidden shadow-lg"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/70" />
                  <div className="w-3 h-3 rounded-full bg-warning/70" />
                  <div className="w-3 h-3 rounded-full bg-success/70" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  preview.portfolioai.dev
                </span>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-[calc(100%-52px)] overflow-auto">
              {isLoading ? (
                <PreviewSkeleton />
              ) : (
                <PreviewContent 
                  cvData={cvData} 
                  theme={websiteConfig.theme} 
                  sections={visibleSections}
                  onEditSection={handleEditSection}
                  onStyleSection={handleStyleSection}
                />
              )}
            </div>
          </motion.div>

          {/* Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 space-y-6 overflow-auto"
          >
            <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
              <h3 className="text-lg font-semibold font-display mb-4">Customize</h3>
              <div className="space-y-6">
                <ThemeSelector />
                <SectionToggle />
              </div>
            </div>

            {/* Hint Card */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">💡 Tip:</span> Right-click on any section in the preview to edit content, change style, or hide it.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => navigate('/review')}
              >
                <Edit3 className="h-5 w-5 mr-2" />
                Edit Content
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => setDeployModalOpen(true)}
              >
                <Rocket className="h-5 w-5 mr-2" />
                Deploy Website
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <DeployModal open={deployModalOpen} onOpenChange={setDeployModalOpen} />

      {/* Edit Section Modal */}
      <Dialog 
        open={editingSection?.type === 'content' && (editingSection.id === 'hero' || editingSection.id === 'about' || editingSection.id === 'header')} 
        onOpenChange={() => setEditingSection(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {editingSection?.id === 'hero' ? 'Hero' : editingSection?.id === 'about' ? 'About' : 'Header'} Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Headline</label>
              <Input
                value={editForm.headline || ''}
                onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Summary</label>
              <Textarea
                value={editForm.summary || ''}
                onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Preview Content Component with EditableBlock wrappers
function PreviewContent({
  cvData,
  theme,
  sections,
  onEditSection,
  onStyleSection,
}: {
  cvData: NonNullable<ReturnType<typeof usePortfolioStore.getState>['cvData']>;
  theme: string;
  sections: { id: string; name: string }[];
  onEditSection: (sectionId: string) => void;
  onStyleSection: (sectionId: string) => void;
}) {
  const themeClasses = {
    modern: 'bg-background',
    minimal: 'bg-background',
    dark: 'bg-foreground text-background',
  };

  return (
    <div className={`min-h-full ${themeClasses[theme as keyof typeof themeClasses]}`}>
      {/* Preview Header */}
      <EditableBlock
        sectionId="header"
        sectionName="Header"
        onEdit={() => onEditSection('header')}
        onStyleChange={() => onStyleSection('header')}
      >
        <header className={`px-8 py-6 border-b ${theme === 'dark' ? 'border-background/10' : 'border-border'}`}>
          <nav className="flex items-center justify-between max-w-5xl mx-auto">
            <span className="text-xl font-bold font-display">
              {cvData.personal_info?.full_name?.split(' ')[0] || 'Portfolio'}
            </span>
            <div className="flex gap-6 text-sm">
              {sections.slice(1).map((section) => (
                <span
                  key={section.id}
                  className={`${theme === 'dark' ? 'text-background/70 hover:text-background' : 'text-muted-foreground hover:text-foreground'} cursor-pointer transition-colors`}
                >
                  {section.name}
                </span>
              ))}
            </div>
          </nav>
        </header>
      </EditableBlock>

      {/* Hero Section */}
      {sections.some((s) => s.id === 'hero') && (
        <EditableBlock
          sectionId="hero"
          sectionName="Hero"
          onEdit={() => onEditSection('hero')}
          onStyleChange={() => onStyleSection('hero')}
        >
          <section className="px-8 py-20 text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl font-bold font-display mb-4">
                Hi, I'm {cvData.personal_info?.full_name || 'there'}
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-background/70' : 'text-primary'} mb-4`}>
                {cvData.personal_info?.headline}
              </p>
              <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-background/60' : 'text-muted-foreground'}`}>
                {cvData.summary}
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <button className="px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-medium">
                  View My Work
                </button>
                <button className={`px-6 py-3 rounded-lg border ${theme === 'dark' ? 'border-background/20 text-background' : 'border-border'} font-medium`}>
                  Contact Me
                </button>
              </div>
            </motion.div>
          </section>
        </EditableBlock>
      )}

      {/* About Section */}
      {sections.some((s) => s.id === 'about') && (
        <EditableBlock
          sectionId="about"
          sectionName="About"
          onEdit={() => onEditSection('about')}
          onStyleChange={() => onStyleSection('about')}
        >
          <section className={`px-8 py-16 ${theme === 'dark' ? 'bg-background/5' : 'bg-muted/30'}`}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold font-display mb-6">About Me</h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-background/70' : 'text-muted-foreground'}`}>
                {cvData.summary}
              </p>
            </div>
          </section>
        </EditableBlock>
      )}

      {/* Skills Section */}
      {sections.some((s) => s.id === 'skills') && (
        <EditableBlock
          sectionId="skills"
          sectionName="Skills"
          onEdit={() => onEditSection('skills')}
          onStyleChange={() => onStyleSection('skills')}
        >
          <section className={`px-8 py-16 ${theme === 'dark' ? '' : 'bg-muted/30'}`}>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold font-display mb-8 text-center">Skills</h2>
              <div className="space-y-6">
                {cvData.skills && Object.entries(cvData.skills).map(([category, skills]) => (
                  <div key={category} className="text-center">
                    <h3 className="text-sm font-semibold capitalize mb-3 opacity-70">{category}</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {Array.isArray(skills) && skills.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            theme === 'dark'
                              ? 'bg-background/10 text-background'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </EditableBlock>
      )}

      {/* Experience Section */}
      {sections.some((s) => s.id === 'experience') && (
        <EditableBlock
          sectionId="experience"
          sectionName="Experience"
          onEdit={() => onEditSection('experience')}
          onStyleChange={() => onStyleSection('experience')}
        >
          <section className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-display mb-8 text-center">Experience</h2>
              <div className="space-y-8">
                {Array.isArray(cvData.experience) && cvData.experience.map((exp, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-background/5' : 'bg-card border border-border'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{exp.role}</h3>
                        <p className={theme === 'dark' ? 'text-background/70' : 'text-primary'}>
                          {exp.company}
                        </p>
                      </div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-background/50' : 'text-muted-foreground'}`}>
                        {exp.duration}
                      </span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {Array.isArray(exp.description) && exp.description.map((item, i) => (
                        <li key={i} className={`text-sm flex items-start gap-2 ${theme === 'dark' ? 'text-background/60' : 'text-muted-foreground'}`}>
                          <span className="text-primary mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </EditableBlock>
      )}

      {/* Projects Section */}
      {sections.some((s) => s.id === 'projects') && (
        <EditableBlock
          sectionId="projects"
          sectionName="Projects"
          onEdit={() => onEditSection('projects')}
          onStyleChange={() => onStyleSection('projects')}
        >
          <section className={`px-8 py-16 ${theme === 'dark' ? 'bg-background/5' : 'bg-muted/30'}`}>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold font-display mb-8 text-center">Projects</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Array.isArray(cvData.projects) && cvData.projects.map((project, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-background/10' : 'bg-card border border-border'}`}
                  >
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className={`mb-4 ${theme === 'dark' ? 'text-background/60' : 'text-muted-foreground'}`}>
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(project.technologies) && project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            theme === 'dark' ? 'bg-background/10' : 'bg-muted'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </EditableBlock>
      )}

      {/* Education Section */}
      {sections.some((s) => s.id === 'education') && (
        <EditableBlock
          sectionId="education"
          sectionName="Education"
          onEdit={() => onEditSection('education')}
          onStyleChange={() => onStyleSection('education')}
        >
          <section className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-display mb-8 text-center">Education</h2>
              <div className="space-y-6">
                {Array.isArray(cvData.education) && cvData.education.map((edu, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-background/5' : 'bg-card border border-border'}`}
                  >
                    <h3 className="text-xl font-semibold">{edu.institution}</h3>
                    <p className={theme === 'dark' ? 'text-background/70' : 'text-primary'}>
                      {edu.degree}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-background/50' : 'text-muted-foreground'}`}>
                      {edu.duration}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </EditableBlock>
      )}
      {/* Contact Section */}
      {sections.some((s) => s.id === 'contact') && (
        <EditableBlock
          sectionId="contact"
          sectionName="Contact"
          onEdit={() => onEditSection('contact')}
          onStyleChange={() => onStyleSection('contact')}
        >
          <section className={`px-8 py-16 ${theme === 'dark' ? 'bg-background/5' : 'bg-muted/30'}`}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold font-display mb-6">Get In Touch</h2>
              <p className={`mb-8 ${theme === 'dark' ? 'text-background/70' : 'text-muted-foreground'}`}>
                I'm always open to discussing new opportunities and interesting projects.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`mailto:${cvData.personal_info?.email}`}
                  className="px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-medium"
                >
                  {cvData.personal_info?.email}
                </a>
                {cvData.personal_info?.linkedin && (
                  <a
                    href={cvData.personal_info?.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 py-3 rounded-lg border ${theme === 'dark' ? 'border-background/20 text-background' : 'border-border'} font-medium`}
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </section>
        </EditableBlock>
      )}

      {/* Preview Footer */}
      <footer className={`px-8 py-10 border-t ${theme === 'dark' ? 'border-background/10' : 'border-border'} text-center`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-background/50' : 'text-muted-foreground'}`}>
          © {new Date().getFullYear()} {cvData.personal_info?.full_name || 'Portfolio'}. Built with PortfolioAI.
        </p>
      </footer>
    </div>
  );
}
