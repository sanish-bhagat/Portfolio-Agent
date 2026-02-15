import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '@/store/portfolioStore';
import { FileUpload } from '@/components/FileUpload';
import { StepIndicator } from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { parse_cv_tool, store_user_state_tool } from '@/services/agent/tools';

export default function UploadPage() {
  const navigate = useNavigate();
  const { setUploadedFile, uploadedFile, setIsExtracting, isExtracting, setCVData, setCurrentStep, setUserId, websiteConfig, deployment } =
    usePortfolioStore();

  const handleFileSelect = useCallback(
    (file: File) => {
      setUploadedFile(file);
      setCurrentStep('upload');
    },
    [setUploadedFile, setCurrentStep]
  );

  const handleProcessCV = async () => {
    if (!uploadedFile) return;

    setIsExtracting(true);
    try {
      console.log('[UploadPage] Starting CV extraction...');
      // Call the agent's parse tool
      const { cv_data, user_id } = await parse_cv_tool(uploadedFile);
      
      console.log('[UploadPage] Extraction successful:', { cv_data, user_id });
      
      // Update store
      setCVData(cv_data);
      setUserId(user_id);
      
      // Persist state using agent's store tool
      console.log('[UploadPage] Persisting state...');
      await store_user_state_tool(user_id, {
        cvData: cv_data,
        websiteConfig,
        deployment,
        currentStep: 'review'
      });
      console.log('[UploadPage] State persisted');

      setIsExtracting(false);
      setCurrentStep('review');
      toast.success('CV processed successfully!');
      navigate('/review');
    } catch (error) {
      console.error('[UploadPage] Failed to parse CV:', error);
      toast.error('Failed to process CV. Please try again.');
      setIsExtracting(false);
    }
  };


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

          <div className="space-y-8">
            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={isExtracting}
              acceptedTypes={['.pdf', '.docx']}
            />

            {uploadedFile && !isExtracting && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <Button 
                  size="lg" 
                  onClick={handleProcessCV}
                  className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Continue to Review
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {isExtracting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 text-primary"
              >
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="font-medium">Analyzing your professional profile...</p>
              </motion.div>
            )}
          </div>

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
