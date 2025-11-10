"use client";

import { useState } from "react";
import EisenhowerMatrix from "./components/EisenhowerMatrix";
import AIBlueprintOrganizer from "./components/AIBlueprintOrganizer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"matrix" | "blueprint">("matrix");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Task Matrix & AI Blueprint Organizer
        </h1>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "matrix"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Eisenhower Matrix
          </button>
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "blueprint"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            AI Blueprint Organizer
          </button>
        </div>

        {activeTab === "matrix" ? (
          <EisenhowerMatrix />
        ) : (
          <AIBlueprintOrganizer />
        )}
      </div>
    </div>
  );
}
