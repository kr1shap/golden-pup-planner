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
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <div className="text-base">{icon}</div>
        <span className="text-[10px] font-semibold text-foreground/70">{label}</span>
      </div>
      <Progress 
        value={value} 
        className={cn("h-1.5", colorClass)}
      />
    </div>
  );
};
