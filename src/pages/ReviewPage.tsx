import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '@/store/portfolioStore';
import { StepIndicator } from '@/components/StepIndicator';
import { EditableCard } from '@/components/EditableCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export default function ReviewPage() {
  const navigate = useNavigate();
  const { cvData, setCurrentStep, updatePersonalInfo } = usePortfolioStore();
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
        fullName: cvData.personalInfo.fullName,
        title: cvData.personalInfo.title,
        email: cvData.personalInfo.email,
        phone: cvData.personalInfo.phone,
        location: cvData.personalInfo.location,
        summary: cvData.personalInfo.summary,
      });
    }
  };

  const handleSave = () => {
    if (editingSection === 'personal') {
      updatePersonalInfo({
        fullName: editForm.fullName,
        title: editForm.title,
        email: editForm.email,
        phone: editForm.phone,
        location: editForm.location,
        summary: editForm.summary,
      });
      toast.success('Personal information updated!');
    }
    setEditingSection(null);
  };

  const handleContinue = () => {
    setCurrentStep('preview');
    navigate('/preview');
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
                  <p className="text-2xl font-bold font-display">{cvData.personalInfo.fullName}</p>
                  <p className="text-primary font-medium">{cvData.personalInfo.title}</p>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{cvData.personalInfo.email}</p>
                  <p>{cvData.personalInfo.phone}</p>
                  <p>{cvData.personalInfo.location}</p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">{cvData.personalInfo.summary}</p>
            </EditableCard>

            {/* Skills */}
            <EditableCard
              title="Skills"
              icon={<Code className="h-5 w-5" />}
              onEdit={() => handleEdit('skills')}
            >
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {skill.name}
                  </span>
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
                {cvData.experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-primary/20 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{exp.position}</h4>
                        <p className="text-primary text-sm">{exp.company}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                    <ul className="mt-2 space-y-1">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {highlight}
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
                {cvData.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <h4 className="font-semibold">{project.name}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
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
                {cvData.education.map((edu) => (
                  <div key={edu.id}>
                    <h4 className="font-semibold">{edu.institution}</h4>
                    <p className="text-primary text-sm">
                      {edu.degree} in {edu.field}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {edu.startDate} - {edu.endDate}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
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
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
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
