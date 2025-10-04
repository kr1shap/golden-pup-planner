import { useState } from "react";
import { Utensils, Droplet, Brain, BookOpen } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskList } from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import goldenDog from "@/assets/golden-dog.png";

const Index = () => {
  const [foodLevel, setFoodLevel] = useState(75);
  const [waterLevel, setWaterLevel] = useState(60);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-[400px] h-[400px] bg-card rounded-2xl shadow-xl p-4 flex flex-col gap-2.5">
        {/* Pet Display - Top and Biggest */}
        <div className="flex items-center justify-center pt-1">
          <img 
            src={goldenDog} 
            alt="Golden dog companion" 
            className="w-40 h-40 object-contain drop-shadow-lg animate-fade-in"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="default" 
            className="w-full h-9 text-xs font-medium hover-scale"
          >
            <Brain className="w-3.5 h-3.5 mr-1.5" />
            Meditate
          </Button>
          <Button 
            variant="default"
            className="w-full h-9 text-xs font-medium hover-scale"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Learning
          </Button>
        </div>

        {/* Stats Bars - Below Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <ProgressBar 
            icon={<Utensils className="w-4 h-4" style={{ color: "hsl(var(--food))" }} />}
            value={foodLevel}
            label="Food"
            colorClass="[&>div]:bg-[hsl(var(--food))]"
          />
          <ProgressBar 
            icon={<Droplet className="w-4 h-4" style={{ color: "hsl(var(--water))" }} />}
            value={waterLevel}
            label="Water"
            colorClass="[&>div]:bg-[hsl(var(--water))]"
          />
        </div>

        {/* Task List */}
        <div className="flex-1 min-h-0">
          <TaskList />
        </div>
      </div>
    </div>
  );
};

export default Index;
