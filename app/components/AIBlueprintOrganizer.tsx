"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Upload, Save, FileText, Database } from "lucide-react";

interface Blueprint {
  ir: string;
  kcs: string;
  kcsFormat: "json" | "jsonl";
}

interface KCSChunk {
  id: string;
  content: string;
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    characterCount: number;
    wordCount: number;
    timestamp: string;
  };
}

export default function AIBlueprintOrganizer() {
  const [blueprint, setBlueprint] = useState<Blueprint>({
    ir: "",
    kcs: "",
    kcsFormat: "json",
  });

  const [savedBlueprints, setSavedBlueprints] = useState<
    Array<{ name: string; data: Blueprint; timestamp: string }>
  >([]);

  const irFileInputRef = useRef<HTMLInputElement>(null);
  const kcsFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ai-blueprints");
    if (saved) {
      setSavedBlueprints(JSON.parse(saved));
    }
  }, []);

  const convertIRToMarkdown = (text: string): string => {
    let markdown = text;

    // Convert headers
    markdown = markdown.replace(/^# (.+)$/gm, "# $1");
    markdown = markdown.replace(/^## (.+)$/gm, "## $1");

    // Convert bold
    markdown = markdown.replace(/\*\*(.+?)\*\*/g, "**$1**");

    // Convert lists
    markdown = markdown.replace(/^- (.+)$/gm, "- $1");
    markdown = markdown.replace(/^\* (.+)$/gm, "* $1");
    markdown = markdown.replace(/^(\d+)\. (.+)$/gm, "$1. $2");

    // Add sections if not present
    if (!markdown.includes("# ")) {
      markdown = "# AI Model Instructions\n\n" + markdown;
    }

    return markdown;
  };

  const chunkKCS = (text: string, chunkSize: number = 1000): KCSChunk[] => {
    const chunks: KCSChunk[] = [];
    const words = text.split(/\s+/);
    const totalChunks = Math.ceil(words.length / chunkSize);

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunkWords = words.slice(i, i + chunkSize);
      const content = chunkWords.join(" ");
      const chunkIndex = Math.floor(i / chunkSize);

      chunks.push({
        id: `chunk_${chunkIndex}_${Date.now()}`,
        content,
        metadata: {
          chunkIndex,
          totalChunks,
          characterCount: content.length,
          wordCount: chunkWords.length,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return chunks;
  };

  const exportKCSWithMetadata = (format: "json" | "jsonl"): string => {
    const chunks = chunkKCS(blueprint.kcs);

    if (format === "json") {
      return JSON.stringify({ chunks }, null, 2);
    } else {
      return chunks.map((chunk) => JSON.stringify(chunk)).join("\n");
    }
  };

  const saveBlueprint = () => {
    const name = prompt("Enter a name for this blueprint:");
    if (!name) return;

    const newBlueprint = {
      name,
      data: {
        ...blueprint,
        ir: convertIRToMarkdown(blueprint.ir),
      },
      timestamp: new Date().toISOString(),
    };

    const updated = [...savedBlueprints, newBlueprint];
    setSavedBlueprints(updated);
    localStorage.setItem("ai-blueprints", JSON.stringify(updated));

    alert("Blueprint saved successfully!");
  };

  const loadBlueprint = (index: number) => {
    const selected = savedBlueprints[index];
    setBlueprint(selected.data);
  };

  const deleteBlueprint = (index: number) => {
    const updated = savedBlueprints.filter((_, i) => i !== index);
    setSavedBlueprints(updated);
    localStorage.setItem("ai-blueprints", JSON.stringify(updated));
  };

  const exportIR = () => {
    const markdown = convertIRToMarkdown(blueprint.ir);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ir_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportKCS = () => {
    const data = exportKCSWithMetadata(blueprint.kcsFormat);
    const extension = blueprint.kcsFormat === "json" ? "json" : "jsonl";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kcs_${Date.now()}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importIR = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBlueprint({ ...blueprint, ir: text });
    };
    reader.readAsText(file);
  };

  const importKCS = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBlueprint({ ...blueprint, kcs: text });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            AI Model Blueprint Manager
          </h2>
          <button
            onClick={saveBlueprint}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save size={18} />
            Save Blueprint
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-indigo-600" />
                  Instructional Ruleset (IR)
                </h3>
                <p className="text-sm text-gray-600">
                  Define persona and behavior rules
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  ref={irFileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={importIR}
                  className="hidden"
                />
                <button
                  onClick={() => irFileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Import IR"
                >
                  <Upload size={18} />
                </button>
                <button
                  onClick={exportIR}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Export IR as Markdown"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            <textarea
              value={blueprint.ir}
              onChange={(e) =>
                setBlueprint({ ...blueprint, ir: e.target.value })
              }
              placeholder="Enter AI model instructions, persona, and behavior rules..."
              className="w-full h-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Format:</strong> Text will be automatically converted
                to Markdown on save/export.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Database size={20} className="text-green-600" />
                  Knowledge Compendium Synthesis (KCS)
                </h3>
                <p className="text-sm text-gray-600">
                  Define knowledge base content
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  ref={kcsFileInputRef}
                  type="file"
                  accept=".txt,.json,.jsonl"
                  onChange={importKCS}
                  className="hidden"
                />
                <button
                  onClick={() => kcsFileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Import KCS"
                >
                  <Upload size={18} />
                </button>
                <button
                  onClick={exportKCS}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Export KCS with metadata"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            <textarea
              value={blueprint.kcs}
              onChange={(e) =>
                setBlueprint({ ...blueprint, kcs: e.target.value })
              }
              placeholder="Enter knowledge base content, facts, examples, and reference materials..."
              className="w-full h-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Export Format:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="json"
                    checked={blueprint.kcsFormat === "json"}
                    onChange={(e) =>
                      setBlueprint({
                        ...blueprint,
                        kcsFormat: e.target.value as "json",
                      })
                    }
                    className="text-indigo-600"
                  />
                  <span className="text-sm">JSON</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="jsonl"
                    checked={blueprint.kcsFormat === "jsonl"}
                    onChange={(e) =>
                      setBlueprint({
                        ...blueprint,
                        kcsFormat: e.target.value as "jsonl",
                      })
                    }
                    className="text-indigo-600"
                  />
                  <span className="text-sm">JSONL</span>
                </label>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Processing:</strong> KCS will be chunked and enriched
                with metadata (chunk index, word count, timestamp) on
                save/export.
              </p>
            </div>
          </div>
        </div>
      </div>

      {savedBlueprints.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Saved Blueprints
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedBlueprints.map((saved, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold text-gray-800 mb-2">
                  {saved.name}
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(saved.timestamp).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadBlueprint(index)}
                    className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteBlueprint(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
