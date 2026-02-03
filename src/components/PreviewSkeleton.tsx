import { motion } from 'framer-motion';

export function PreviewSkeleton() {
  return (
    <div className="w-full h-full bg-card rounded-lg overflow-hidden">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border px-6 flex items-center justify-between">
        <motion.div
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-8 w-32 rounded-lg bg-muted"
        />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              className="h-4 w-16 rounded bg-muted"
            />
          ))}
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="p-8 space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-12 w-3/4 mx-auto rounded-lg bg-muted"
          />
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="h-6 w-1/2 mx-auto rounded bg-muted"
          />
          <div className="flex justify-center gap-4 pt-4">
            <motion.div
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="h-12 w-32 rounded-lg bg-primary/20"
            />
            <motion.div
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="h-12 w-32 rounded-lg bg-muted"
            />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-8 space-y-8">
        <motion.div
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-8 w-48 rounded-lg bg-muted"
        />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              className="h-32 rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
