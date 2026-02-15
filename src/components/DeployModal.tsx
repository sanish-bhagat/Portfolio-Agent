import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore, DeploymentPlatform } from '@/store/portfolioStore';
import { deploy_site_tool, store_user_state_tool } from '@/services/agent/tools';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, Check, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DeployModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const platforms: { id: DeploymentPlatform; name: string; logo: string }[] = [
  { id: 'vercel', name: 'Vercel', logo: '▲' },
  { id: 'netlify', name: 'Netlify', logo: '◆' },
];

export function DeployModal({ open, onOpenChange }: DeployModalProps) {
  const navigate = useNavigate();
  const { userId, deployment, setDeploymentPlatform, setDeploymentStatus, cvData, websiteConfig } = usePortfolioStore();

  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    if (!userId) {
      toast.error('Session expired. Please re-upload your CV.');
      return;
    }

    setDeploymentStatus('deploying');
    
    try {
      // Tool 7: Deployment Tool
      const result = await deploy_site_tool(userId, deployment.platform);
      
      setDeploymentStatus('success', result.live_url);
      
      // Store deployment metadata
      await store_user_state_tool(userId, {
        cvData,
        websiteConfig,
        deployment: { ...deployment, status: 'success', url: result.live_url },
        currentStep: 'deploy',
        deployedAt: new Date().toISOString()
      });
      
      toast.success('Your portfolio has been deployed!');
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentStatus('error', undefined, 'Failed to deploy site.');
      toast.error('Deployment failed. Please try again.');
    }
  };


  const copyUrl = () => {
    if (deployment.url) {
      navigator.clipboard.writeText(deployment.url);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {deployment.status === 'success' ? 'Deployment Successful! 🎉' : 'Deploy Your Portfolio'}
          </DialogTitle>
          <DialogDescription>
            {deployment.status === 'success'
              ? 'Your portfolio website is now live.'
              : 'Choose a platform and deploy your portfolio in seconds.'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {deployment.status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                <Check className="h-6 w-6 text-success" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Your site is live</p>
                  <p className="text-xs text-muted-foreground truncate">{deployment.url}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={copyUrl}
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => window.open(deployment.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Site
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setDeploymentStatus('idle');
                  onOpenChange(false);
                }}
              >
                Edit & Redeploy
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="deploy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <motion.button
                    key={platform.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeploymentPlatform(platform.id)}
                    disabled={deployment.status === 'deploying'}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200',
                      deployment.platform === platform.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                      deployment.status === 'deploying' && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="text-2xl">{platform.logo}</span>
                    <span className="text-sm font-medium">{platform.name}</span>
                    {deployment.platform === platform.id && (
                      <motion.div
                        layoutId="platformIndicator"
                        className="h-1 w-8 rounded-full bg-primary"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleDeploy}
                disabled={deployment.status === 'deploying'}
              >
                {deployment.status === 'deploying' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2" />
                    Deploy Now
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
