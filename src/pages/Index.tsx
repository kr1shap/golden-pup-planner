import { useState } from "react";
import { Utensils, Droplet } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskList } from "@/components/TaskList";
import goldenDog from "@/assets/golden-dog.png";

const Index = () => {
  const [foodLevel, setFoodLevel] = useState(75);
  const [waterLevel, setWaterLevel] = useState(60);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-[400px] h-[400px] bg-card rounded-2xl shadow-xl p-5 flex flex-col">
        {/* Stats Bars */}
        <div className="space-y-3 mb-4">
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

        {/* Pet Display */}
        <div className="flex-1 flex items-center justify-center my-2">
          <div className="relative">
            <img 
              src={goldenDog} 
              alt="Golden dog companion" 
              className="w-32 h-32 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="mt-auto">
          <TaskList />
        </div>
      </div>
    </div>
  );
};

export default Index;
