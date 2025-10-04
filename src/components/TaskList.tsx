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
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-foreground/90 tracking-wide">TASKS</h3>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-primary/10">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-2 group animate-fade-in">
            <Checkbox 
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
              className="h-3 w-3"
            />
            <span className={cn(
              "text-[11px] leading-tight",
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
