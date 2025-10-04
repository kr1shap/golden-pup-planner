import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Complete daily workout", completed: false },
    { id: "2", text: "Finish project report", completed: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground/90">Tasks</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-1.5 max-h-20 overflow-y-auto">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-2 group">
            <Checkbox 
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
              className="h-3.5 w-3.5"
            />
            <span className={cn(
              "text-xs",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
