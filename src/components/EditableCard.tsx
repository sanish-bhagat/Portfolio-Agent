import { motion } from 'framer-motion';
import { Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EditableCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onEdit?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function EditableCard({
  title,
  icon,
  children,
  onEdit,
  isEditing = false,
  onSave,
  onCancel,
  className,
}: EditableCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative rounded-2xl bg-card border border-border p-6 shadow-card transition-all duration-300 hover:shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground font-display">
            {title}
          </h3>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" variant="success" onClick={onSave}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      <div className="text-foreground">{children}</div>
    </motion.div>
  );
}
