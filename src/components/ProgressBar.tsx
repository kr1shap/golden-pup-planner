import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  colorClass: string;
}

export const ProgressBar = ({ icon, value, label, colorClass }: ProgressBarProps) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="text-lg">{icon}</div>
        <span className="text-xs font-medium text-foreground/80">{label}</span>
      </div>
      <Progress 
        value={value} 
        className={cn("h-2", colorClass)}
      />
    </div>
  );
};
