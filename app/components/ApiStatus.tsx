"use client";
import { useEffect, useState } from "react";

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "healthy" | "error">(
    "checking"
  );
  const [lastChecked, setLastChecked] = useState<string>("");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("http://localhost:8000/health");
        if (response.ok) {
          setStatus("healthy");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
      setLastChecked(new Date().toLocaleTimeString());
    };

    // Check immediately
    checkHealth();

    // Check every 5 seconds
    const interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          API Status
        </h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === "healthy"
                ? "bg-green-500"
                : status === "error"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {status === "healthy"
              ? "Connected"
              : status === "error"
              ? "Disconnected"
              : "Checking..."}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex justify-between">
          <span>Backend:</span>
          <span className="font-mono">http://localhost:8000</span>
        </div>
        <div className="flex justify-between">
          <span>Last checked:</span>
          <span className="font-mono">{lastChecked || "Never"}</span>
        </div>
      </div>
    </div>
  );
}
