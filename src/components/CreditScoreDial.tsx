import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CreditScoreDialProps {
  score: number;
  maxScore?: number;
  minScore?: number;
  previousScore?: number;
  bureau?: string;
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 750) return "score-excellent";
  if (score >= 700) return "score-good";
  if (score >= 650) return "score-fair";
  if (score >= 600) return "score-poor";
  return "score-bad";
};

const getScoreLabel = (score: number): string => {
  if (score >= 750) return "Excellent";
  if (score >= 700) return "Good";
  if (score >= 650) return "Fair";
  if (score >= 600) return "Poor";
  return "Needs Work";
};

const getScoreColorClass = (score: number): string => {
  if (score >= 750) return "text-score-excellent";
  if (score >= 700) return "text-score-good";
  if (score >= 650) return "text-score-fair";
  if (score >= 600) return "text-score-poor";
  return "text-score-bad";
};

export function CreditScoreDial({
  score,
  maxScore = 850,
  minScore = 300,
  previousScore,
  bureau,
  className,
}: CreditScoreDialProps) {
  const [animatedScore, setAnimatedScore] = useState(minScore);
  const [isAnimating, setIsAnimating] = useState(true);

  const range = maxScore - minScore;
  const normalizedScore = ((animatedScore - minScore) / range) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference * 0.75;
  
  const scoreChange = previousScore ? score - previousScore : 0;

  useEffect(() => {
    setIsAnimating(true);
    const duration = 1500;
    const startTime = Date.now();
    const startScore = minScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(startScore + (score - startScore) * easeOut);
      
      setAnimatedScore(currentScore);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [score, minScore]);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="relative w-48 h-48">
        {/* Background glow */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full blur-2xl opacity-30 transition-opacity duration-500",
            isAnimating ? "opacity-50" : "opacity-30"
          )}
          style={{
            background: `radial-gradient(circle, hsl(var(--${getScoreColor(score)})) 0%, transparent 70%)`,
          }}
        />
        
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 160 160">
          {/* Background arc */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            className="opacity-30"
          />
          
          {/* Progress arc */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={`hsl(var(--${getScoreColor(animatedScore)}))`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100 drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 8px hsl(var(--${getScoreColor(animatedScore)}) / 0.5))`,
            }}
          />
          
          {/* Gradient overlay for depth */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className={cn(
              "text-5xl font-bold tracking-tight transition-colors duration-300 font-mono",
              getScoreColorClass(animatedScore)
            )}
          >
            {animatedScore}
          </span>
          <span className={cn(
            "text-sm font-medium mt-1 transition-colors duration-300",
            getScoreColorClass(animatedScore)
          )}>
            {getScoreLabel(animatedScore)}
          </span>
          {bureau && (
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              {bureau}
            </span>
          )}
        </div>
      </div>

      {/* Score change indicator */}
      {previousScore && scoreChange !== 0 && (
        <div className={cn(
          "flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium",
          scoreChange > 0 
            ? "bg-success/20 text-success" 
            : "bg-destructive/20 text-destructive"
        )}>
          <span>{scoreChange > 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(scoreChange)} pts</span>
        </div>
      )}

      {/* Score range */}
      <div className="flex justify-between w-full mt-4 px-4 text-xs text-muted-foreground">
        <span>{minScore}</span>
        <span>{maxScore}</span>
      </div>
    </div>
  );
}
