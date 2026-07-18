import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function ProgressBar({ value = 0, max = 100, className, showLabel = false, color = "brand" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colorMap = {
    brand:  "from-brand-600 to-accent-purple",
    green:  "from-accent-green to-emerald-400",
    orange: "from-accent-orange to-amber-400",
    pink:   "from-accent-pink to-rose-400",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-muted">
          <span>{pct}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className="progress-track">
        <motion.div
          className={cn("progress-fill bg-gradient-to-r", colorMap[color])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
