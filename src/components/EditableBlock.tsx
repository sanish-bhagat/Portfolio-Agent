import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Palette, EyeOff, GripVertical } from 'lucide-react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { cn } from '@/lib/utils';

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface EditableBlockProps {
  sectionId: string;
  sectionName: string;
  children: React.ReactNode;
  onEdit?: () => void;
  onStyleChange?: () => void;
  className?: string;
}

export function EditableBlock({
  sectionId,
  sectionName,
  children,
  onEdit,
  onStyleChange,
  className,
}: EditableBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const toggleSectionVisibility = usePortfolioStore((state) => state.toggleSectionVisibility);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleEdit = useCallback(() => {
    closeContextMenu();
    onEdit?.();
  }, [closeContextMenu, onEdit]);

  const handleStyleChange = useCallback(() => {
    closeContextMenu();
    onStyleChange?.();
  }, [closeContextMenu, onStyleChange]);

  const handleHide = useCallback(() => {
    closeContextMenu();
    toggleSectionVisibility(sectionId);
  }, [closeContextMenu, sectionId, toggleSectionVisibility]);

  return (
    <>
      <div
        className={cn(
          'relative group transition-all duration-200',
          isHovered && 'ring-2 ring-primary/50 ring-offset-2 rounded-lg',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
      >
        {/* Section label on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 z-10"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                <GripVertical className="h-3 w-3" />
                {sectionName}
                <span className="opacity-70">• Right-click to edit</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </div>

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-50"
              onClick={closeContextMenu}
              onContextMenu={(e) => {
                e.preventDefault();
                closeContextMenu();
              }}
            />

            {/* Context Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="fixed z-50 min-w-[180px] rounded-xl bg-popover border border-border shadow-xl overflow-hidden"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
              }}
            >
              <div className="p-1">
                <ContextMenuItem
                  icon={<Edit3 className="h-4 w-4" />}
                  label="Edit content"
                  onClick={handleEdit}
                />
                <ContextMenuItem
                  icon={<Palette className="h-4 w-4" />}
                  label="Change style"
                  onClick={handleStyleChange}
                />
                <div className="h-px bg-border my-1" />
                <ContextMenuItem
                  icon={<EyeOff className="h-4 w-4" />}
                  label="Hide section"
                  onClick={handleHide}
                  variant="destructive"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface ContextMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

function ContextMenuItem({ icon, label, onClick, variant = 'default' }: ContextMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        variant === 'default' && 'text-foreground hover:bg-accent',
        variant === 'destructive' && 'text-destructive hover:bg-destructive/10'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
