import { useState, useEffect } from "react";
import { Utensils, Droplet, Brain, BookOpen } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskList } from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import dogHappy from "@/assets/doghappy.png";
import dogSadish from "@/assets/dogsad-ish.png";
import dogSad from "@/assets/dogsad.png";

const Index = () => {
  const [foodLevel, setFoodLevel] = useState(0);
  const [waterLevel, setWaterLevel] = useState(70);

  // code that updates the tracked sites but can't make it into a chrome extension

  // // Fetch otherTotal from background script on mount and update foodLevel
  // useEffect(() => {
  //   const fetchOtherTotal = () => {
  //     chrome.runtime.sendMessage({ type: 'getTotals' }, (response) => {
  //       if (response && typeof response.otherTotal === 'number') {
  //         // Convert seconds to minutes and subtract from 100
  //         const timeInMinutes = Math.floor(response.otherTotal / 60);
  //         setFoodLevel(Math.max(100 - timeInMinutes, 0)); // 100 minus time, minimum 0
  //       }
  //     });
  //   };

  //   // Initial fetch
  //   fetchOtherTotal();

  //   // Poll every 5 seconds to keep it updated
  //   const interval = setInterval(fetchOtherTotal, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-[600px] h-[400px] bg-card rounded-2xl shadow-xl p-6 flex gap-6">
        {/* Pet Display */}
        <div className="w-[300px] flex items-center justify-center bg-muted/30 rounded-xl p-4">
          <img
            src={
              foodLevel < 40
                ? dogSad // If foodLevel is 0-39 (low)
                : foodLevel < 60
                  ? dogSadish // If foodLevel is 40-59 (medium)
                  : dogHappy // If foodLevel is 60-100 (high)
            }
            alt="Golden dog companion"
            className="w-45 h-45 object-contain animate-fade-in"
          />
        </div>

        {/* Right Panel - Pet & Stats */}
        <div className="flex flex-col gap-4 w-[240px]">

          {/* Stats Bars */}
          <div className="flex flex-col gap-3">
            {/* Food Stat */}
            <div className="group relative">
              <div className={`absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${foodLevel > 50
                ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30'
                : foodLevel > 25
                  ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30'
                  : 'bg-gradient-to-r from-red-500/30 to-rose-500/30'
                }`} />
              <div className="relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl p-3 border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg shadow-md ${foodLevel > 50
                      ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                      : foodLevel > 25
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                        : 'bg-gradient-to-br from-red-500 to-rose-500'
                      }`}>
                      <Utensils className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold tracking-tight">Food</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className={`text-lg font-bold ${foodLevel > 50
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                      : foodLevel > 25
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                      } bg-clip-text text-transparent`}>
                      {foodLevel}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full shadow-sm transition-all duration-700 ease-out ${foodLevel > 50
                      ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500'
                      : foodLevel > 25
                        ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500'
                        : 'bg-gradient-to-r from-red-500 via-red-400 to-rose-500'
                      }`}
                    style={{ width: `${foodLevel}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Water Stat */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl p-3 border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                      <Droplet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold tracking-tight">Water</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      {waterLevel}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-500 rounded-full shadow-sm transition-all duration-700 ease-out"
                    style={{ width: `${waterLevel}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Button
              variant="default"
              className="w-full h-10 text-xs font-medium"
            >
              <Brain className="w-4 h-4 mr-1.5" />
              Meditate
            </Button>
            <Button
              variant="default"
              className="w-full h-10 text-xs font-medium"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              Learning
            </Button>
          </div>

          {/* Right Panel - Task List */}
          <div className="flex-1 min-w-0 bg-muted/20 rounded-xl p-4">
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;