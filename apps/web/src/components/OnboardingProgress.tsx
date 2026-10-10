import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  step: number;
  total?: number;
  onBack?: () => void;
}

const OnboardingProgress = ({ step, total = 4, onBack }: OnboardingProgressProps) => (
  <div className="flex items-center gap-3 px-6 pt-4 pb-2">
    {onBack ? (
      <button
        onClick={onBack}
        className="p-1.5 -ml-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
      </button>
    ) : (
      <div className="w-8 shrink-0" />
    )}

    <div className="flex flex-1 gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-300',
            i < step ? 'bg-primary' : 'bg-muted',
          )}
        />
      ))}
    </div>

    <span className="text-xs text-muted-foreground font-medium shrink-0 w-12 text-right">
      {step} of {total}
    </span>
  </div>
);

export default OnboardingProgress;
