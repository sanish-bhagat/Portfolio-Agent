import { motion } from 'framer-motion';
import { usePortfolioStore, BuilderStep } from '@/store/portfolioStore';
import { Check } from 'lucide-react';

const steps: { id: BuilderStep; label: string; number: number }[] = [
  { id: 'upload', label: 'Upload CV', number: 1 },
  { id: 'review', label: 'Review', number: 2 },
  { id: 'preview', label: 'Preview', number: 3 },
  { id: 'deploy', label: 'Deploy', number: 4 },
];

const stepOrder: Record<BuilderStep, number> = {
  landing: 0,
  upload: 1,
  review: 2,
  preview: 3,
  deploy: 4,
};

export function StepIndicator() {
  const currentStep = usePortfolioStore((state) => state.currentStep);
  const currentOrder = stepOrder[currentStep];

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = currentOrder > step.number;
        const isActive = currentOrder === step.number;
        const isPending = currentOrder < step.number;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  step-indicator-dot relative
                  ${isCompleted ? 'completed' : ''}
                  ${isActive ? 'active' : ''}
                  ${isPending ? 'pending' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{step.number}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeStep"
                    className="absolute inset-0 rounded-full bg-primary"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={`
                  mt-2 text-xs font-medium transition-colors
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  step-indicator-line mx-2 mb-6
                  ${isCompleted ? 'completed' : 'pending'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
