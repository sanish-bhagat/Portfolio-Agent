import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore, CVData } from '@/store/portfolioStore';
import { FileUpload } from '@/components/FileUpload';
import { StepIndicator } from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Mock CV data for demonstration
const mockCVData: CVData = {
  personalInfo: {
    fullName: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Full Stack Developer',
    summary:
      'Passionate full-stack developer with 7+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies.',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson',
    website: 'alexjohnson.dev',
  },
  skills: [
    { id: '1', name: 'React', level: 'expert', category: 'Frontend' },
    { id: '2', name: 'TypeScript', level: 'expert', category: 'Languages' },
    { id: '3', name: 'Node.js', level: 'advanced', category: 'Backend' },
    { id: '4', name: 'PostgreSQL', level: 'advanced', category: 'Database' },
    { id: '5', name: 'AWS', level: 'intermediate', category: 'Cloud' },
    { id: '6', name: 'Docker', level: 'intermediate', category: 'DevOps' },
    { id: '7', name: 'GraphQL', level: 'advanced', category: 'API' },
    { id: '8', name: 'Tailwind CSS', level: 'expert', category: 'Frontend' },
  ],
  experience: [
    {
      id: '1',
      company: 'TechCorp Inc.',
      position: 'Senior Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      current: true,
      description:
        'Lead developer for the core platform team, responsible for architecture and implementation of key features.',
      highlights: [
        'Architected and led development of a microservices platform serving 1M+ users',
        'Reduced page load times by 40% through performance optimization',
        'Mentored 5 junior developers and established coding standards',
      ],
    },
    {
      id: '2',
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      location: 'Remote',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      description:
        'Built and maintained the core product from MVP to scale.',
      highlights: [
        'Developed real-time collaboration features using WebSockets',
        'Implemented CI/CD pipelines reducing deployment time by 60%',
        'Built RESTful APIs serving 500K+ daily requests',
      ],
    },
  ],
  projects: [
    {
      id: '1',
      name: 'E-Commerce Platform',
      description:
        'Full-featured e-commerce platform with real-time inventory management and payment processing.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      url: 'https://example-ecommerce.com',
      github: 'github.com/alexjohnson/ecommerce',
    },
    {
      id: '2',
      name: 'Task Management App',
      description:
        'Collaborative task management application with real-time updates and team features.',
      technologies: ['Next.js', 'Prisma', 'WebSockets', 'Tailwind'],
      github: 'github.com/alexjohnson/taskapp',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2012-09',
      endDate: '2016-05',
      current: false,
      gpa: '3.8',
      highlights: [
        'Dean\'s List - All semesters',
        'Senior project: Machine learning-based recommendation system',
      ],
    },
  ],
};

export default function UploadPage() {
  const navigate = useNavigate();
  const { setUploadedFile, setIsExtracting, isExtracting, setCVData, setCurrentStep } =
    usePortfolioStore();

  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadedFile(file);
      setIsExtracting(true);
      setCurrentStep('upload');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // In real implementation, this would call: POST /api/upload-cv
      setCVData(mockCVData);
      setIsExtracting(false);
      setCurrentStep('review');
      toast.success('CV processed successfully!');
      navigate('/review');
    },
    [navigate, setCVData, setCurrentStep, setIsExtracting, setUploadedFile]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 dots-pattern opacity-30" />
      <div className="fixed top-1/4 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold font-display text-foreground">PortfolioAI</span>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Step Indicator */}
      <div className="relative z-10 py-8">
        <StepIndicator />
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold font-display mb-4">
            Upload Your CV
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            We'll extract your information and create a beautiful portfolio for you.
          </p>

          <FileUpload
            onFileSelect={handleFileSelect}
            isLoading={isExtracting}
            acceptedTypes={['.pdf', '.docx']}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-semibold mb-3">What we extract:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {['Personal Info', 'Skills', 'Experience', 'Projects', 'Education'].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
