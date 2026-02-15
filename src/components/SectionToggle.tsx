import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import { useShallow } from 'zustand/react/shallow';

export function SectionToggle() {
  const { sections, toggleSectionVisibility, reorderSections } = usePortfolioStore(
    useShallow((state) => ({
      sections: state.websiteConfig.sections,
      toggleSectionVisibility: state.toggleSectionVisibility,
      reorderSections: state.reorderSections,
    }))
  );

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Sections</h4>
      <div className="space-y-2">
        {sortedSections.map((section, index) => (
          <motion.div
            key={section.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center justify-between rounded-lg border p-3 transition-all duration-200',
              section.visible
                ? 'border-border bg-card'
                : 'border-border/50 bg-muted/30 opacity-60'
            )}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <span className="text-sm font-medium text-foreground">{section.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {section.visible ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                checked={section.visible}
                onCheckedChange={() => toggleSectionVisibility(section.id)}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
