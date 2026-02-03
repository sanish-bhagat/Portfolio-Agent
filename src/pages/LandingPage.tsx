import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Eye, Sparkles, ArrowRight, FileText, Palette, Rocket } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Upload Your CV',
    description: 'Simply drag and drop your CV in PDF or DOCX format.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'AI Extraction',
    description: 'Our AI extracts and organizes your professional information.',
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: 'Customize Design',
    description: 'Choose themes and personalize your portfolio layout.',
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: 'Deploy Instantly',
    description: 'One-click deployment to Vercel or Netlify.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 dots-pattern opacity-50" />
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground">PortfolioAI</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button variant="ghost" onClick={() => navigate('/upload')}>
              Sign In
            </Button>
            <Button variant="default" onClick={() => navigate('/upload')}>
              Get Started
            </Button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-6 pt-16 pb-24 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Portfolio Builder
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold font-display mb-6 leading-tight"
            >
              Build Your Portfolio
              <br />
              <span className="gradient-text">From Your CV in Minutes</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Upload your CV, let AI do the magic, and deploy a stunning portfolio website.
              No coding required.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate('/upload')}
                className="group"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload CV
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="heroOutline"
                size="xl"
                onClick={() => navigate('/preview')}
              >
                <Eye className="h-5 w-5 mr-2" />
                View Example
              </Button>
            </motion.div>
          </motion.div>

          {/* Flow visualization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-20 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
              Upload CV
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-3 py-1.5 rounded-full bg-muted">Preview Website</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-3 py-1.5 rounded-full bg-muted">Edit</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-3 py-1.5 rounded-full bg-muted">Deploy</span>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transform your resume into a professional portfolio in four simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="absolute top-4 right-4 text-6xl font-bold text-muted/20 font-display">
                  {index + 1}
                </div>
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold font-display mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold font-display text-primary-foreground mb-6">
                Ready to Build Your Portfolio?
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join thousands of professionals who have created stunning portfolios with PortfolioAI.
              </p>
              <Button
                variant="secondary"
                size="xl"
                onClick={() => navigate('/upload')}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Upload className="h-5 w-5 mr-2" />
                Start Building Now
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold font-display text-foreground">PortfolioAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 PortfolioAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
