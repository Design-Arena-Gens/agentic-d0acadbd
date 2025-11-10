"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

interface Task {
  id: string;
  text: string;
  quadrant: 1 | 2 | 3 | 4;
}

export default function EisenhowerMatrix() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("eisenhower-tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("eisenhower-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const analyzeTaskUrgency = (text: string): 1 | 2 | 3 | 4 => {
    const lowerText = text.toLowerCase();

    const urgentKeywords = [
      "urgent", "asap", "immediately", "now", "today", "emergency",
      "critical", "deadline", "due", "crisis", "fire"
    ];

    const importantKeywords = [
      "important", "strategic", "goal", "plan", "develop", "relationship",
      "health", "career", "learning", "growth", "invest", "long-term"
    ];

    const urgentCount = urgentKeywords.filter(kw => lowerText.includes(kw)).length;
    const importantCount = importantKeywords.filter(kw => lowerText.includes(kw)).length;

    if (urgentCount > 0 && importantCount > 0) return 1;
    if (urgentCount === 0 && importantCount > 0) return 2;
    if (urgentCount > 0 && importantCount === 0) return 3;
    return 4;
  };

  const addTask = () => {
    if (!inputText.trim()) return;

    const quadrant = analyzeTaskUrgency(inputText);
    const newTask: Task = {
      id: Date.now().toString(),
      text: inputText.trim(),
      quadrant,
    };

    setTasks([...tasks, newTask]);
    setInputText("");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getTasksByQuadrant = (quadrant: 1 | 2 | 3 | 4) => {
    return tasks.filter((task) => task.quadrant === quadrant);
  };

  const quadrantConfig = {
    1: {
      title: "DO FIRST",
      subtitle: "Urgent & Important",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      textColor: "text-red-800",
    },
    2: {
      title: "SCHEDULE",
      subtitle: "Not Urgent & Important",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      textColor: "text-green-800",
    },
    3: {
      title: "DELEGATE",
      subtitle: "Urgent & Not Important",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-800",
    },
    4: {
      title: "ELIMINATE",
      subtitle: "Not Urgent & Not Important",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      textColor: "text-gray-800",
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Task</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="Enter your task (include keywords like 'urgent', 'important', 'deadline', 'goal')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={addTask}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Tip: The app automatically categorizes tasks based on urgency keywords. Use words like "urgent", "important", "deadline", "goal", "strategic" to help with categorization.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-white rounded-lg shadow-lg p-6">
        <div className="col-span-2 text-center mb-4">
          <div className="inline-block">
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  IMPORTANT
                </div>
                <div className="h-0.5 w-20 bg-gray-400"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="text-center">← NOT URGENT</div>
                <div className="text-center">URGENT →</div>
              </div>
            </div>
          </div>
        </div>

        {[1, 2, 3, 4].map((q) => {
          const quadrant = q as 1 | 2 | 3 | 4;
          const config = quadrantConfig[quadrant];
          const quadrantTasks = getTasksByQuadrant(quadrant);

          return (
            <div
              key={quadrant}
              className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4 min-h-[300px]`}
            >
              <div className="mb-4">
                <h3 className={`text-lg font-bold ${config.textColor}`}>
                  {config.title}
                </h3>
                <p className="text-sm text-gray-600">{config.subtitle}</p>
              </div>

              <div className="space-y-2">
                {quadrantTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-3 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm text-gray-800 flex-1 pr-2">
                      {task.text}
                    </p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {quadrantTasks.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-8">
                    No tasks in this quadrant
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
