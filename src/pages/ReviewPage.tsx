import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '@/store/portfolioStore';
import { StepIndicator } from '@/components/StepIndicator';
import { EditableCard } from '@/components/EditableCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generate_site_tool, store_user_state_tool } from '@/services/agent/tools';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { 
    cvData, 
    userId,
    setCurrentStep, 
    updatePersonalInfo, 
    updateSummary, 
    websiteConfig, 
    deployment 
  } = usePortfolioStore(
    useShallow((state) => ({
      cvData: state.cvData,
      userId: state.userId,
      setCurrentStep: state.setCurrentStep,
      updatePersonalInfo: state.updatePersonalInfo,
      updateSummary: state.updateSummary,
      websiteConfig: state.websiteConfig,
      deployment: state.deployment,
    }))
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

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

  const handleEdit = (section: string) => {
    setEditingSection(section);
    if (section === 'personal') {
      setEditForm({
        full_name: cvData.personal_info?.full_name || '',
        headline: cvData.personal_info?.headline || '',
        email: cvData.personal_info?.email || '',
        phone: cvData.personal_info?.phone || '',
        location: cvData.personal_info?.location || '',
        summary: cvData.summary || '',
      });
    }
  };

  const handleSave = () => {
    if (editingSection === 'personal') {
      updatePersonalInfo({
        full_name: editForm.full_name,
        headline: editForm.headline,
        email: editForm.email,
        phone: editForm.phone,
        location: editForm.location,
      });
      updateSummary(editForm.summary);
      toast.success('Personal information updated!');
    }
    setEditingSection(null);
  };

  const handleContinue = async () => {
    if (!userId) {
      toast.error('Session expired. Please re-upload your CV.');
      return;
    }

    try {
      toast.loading('Generating your portfolio...');
      
      // Call the backend to generate the site
      await generate_site_tool(userId, websiteConfig.theme);
      
      setCurrentStep('preview');
      
      // Store confirmed state
      await store_user_state_tool(userId, {
        cvData,
        websiteConfig,
        deployment,
        currentStep: 'preview'
      });
      
      toast.dismiss();
      toast.success('Portfolio generated!');
      navigate('/preview');
    } catch (error) {
      console.error('[ReviewPage] Failed to generate site:', error);
      toast.dismiss();
      toast.error('Failed to generate portfolio. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 dots-pattern opacity-30" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/upload')}>
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
      <div className="relative z-10 py-8">
        <StepIndicator />
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold font-display mb-4">
              Review Your Information
            </h1>
            <p className="text-lg text-muted-foreground">
              Make sure everything looks correct before we build your portfolio.
            </p>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <EditableCard
              title="Personal Information"
              icon={<User className="h-5 w-5" />}
              onEdit={() => handleEdit('personal')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold font-display">{cvData.personal_info?.full_name || 'No Name'}</p>
                  <p className="text-primary font-medium">{cvData.personal_info?.headline || 'No Headline'}</p>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{cvData.personal_info?.email}</p>
                  <p>{cvData.personal_info?.phone}</p>
                  <p>{cvData.personal_info?.location}</p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">{cvData.summary}</p>
            </EditableCard>

            {/* Skills */}
            <EditableCard
              title="Skills"
              icon={<Code className="h-5 w-5" />}
              onEdit={() => handleEdit('skills')}
            >
              <div className="space-y-4">
                {cvData.skills && Object.entries(cvData.skills).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold capitalize mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(skills) && skills.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </EditableCard>

            {/* Experience */}
            <EditableCard
              title="Experience"
              icon={<Briefcase className="h-5 w-5" />}
              onEdit={() => handleEdit('experience')}
            >
              <div className="space-y-6">
                {Array.isArray(cvData.experience) && cvData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{exp.role}</h4>
                        <p className="text-primary text-sm">{exp.company}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {exp.duration}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {Array.isArray(exp.description) && exp.description.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </EditableCard>

            {/* Projects */}
            <EditableCard
              title="Projects"
              icon={<Lightbulb className="h-5 w-5" />}
              onEdit={() => handleEdit('projects')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {Array.isArray(cvData.projects) && cvData.projects.map((project, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <h4 className="font-semibold">{project.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Array.isArray(project.technologies) && project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded bg-background text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </EditableCard>

            {/* Education */}
            <EditableCard
              title="Education"
              icon={<GraduationCap className="h-5 w-5" />}
              onEdit={() => handleEdit('education')}
            >
              <div className="space-y-4">
                {Array.isArray(cvData.education) && cvData.education.map((edu, index) => (
                  <div key={index}>
                    <h4 className="font-semibold">{edu.institution}</h4>
                    <p className="text-primary text-sm">
                      {edu.degree}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {edu.duration}
                    </p>
                  </div>
                ))}
              </div>
            </EditableCard>
          </div>
        </motion.div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            All information looks correct?
          </p>
          <Button variant="hero" size="lg" onClick={handleContinue}>
            Looks Good, Build My Website
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editingSection === 'personal'} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone</label>
                <Input
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Location</label>
              <Input
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
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
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
