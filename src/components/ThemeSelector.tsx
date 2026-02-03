import { motion } from 'framer-motion';
import { usePortfolioStore, ThemeType } from '@/store/portfolioStore';
import { Palette, Moon, Sun, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes: { id: ThemeType; name: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'modern',
    name: 'Modern',
    icon: <Palette className="h-5 w-5" />,
    description: 'Clean & colorful',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: <Minimize2 className="h-5 w-5" />,
    description: 'Simple & elegant',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: <Moon className="h-5 w-5" />,
    description: 'Bold & striking',
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = usePortfolioStore((state) => ({
    theme: state.websiteConfig.theme,
    setTheme: state.setTheme,
  }));

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Theme</h4>
      <div className="grid grid-cols-1 gap-3">
        {themes.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTheme(t.id)}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 transition-all duration-200',
              theme === t.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                theme === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {t.icon}
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </div>
            {theme === t.id && (
              <motion.div
                layoutId="themeIndicator"
                className="ml-auto h-2 w-2 rounded-full bg-primary"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
