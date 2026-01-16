"use client";
import { useState } from "react";

export default function Calculator() {
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [operation, setOperation] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const calculate = async (op: string) => {
    setError("");
    setLoading(true);

    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) {
      setError("Please enter valid numbers");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/calculator/${op}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ a: numA, b: numB }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Calculation failed");
        setResult(null);
      } else {
        const data = await response.json();
        setResult(data.result);
        setOperation(data.operation);
      }
    } catch (err) {
      setError("Failed to connect to API. Is the Python backend running?");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Calculator API
      </h3>

      <div className="space-y-4">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              First Number
            </label>
            <input
              type="number"
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="Enter number"
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Second Number
            </label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="Enter number"
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Operation Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => calculate("add")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
          <button
            onClick={() => calculate("subtract")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <button
            onClick={() => calculate("multiply")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ×
          </button>
          <button
            onClick={() => calculate("divide")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ÷
          </button>
        </div>

        {/* Result Display */}
        {result !== null && !error && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-300 mb-1">
              Result ({operation}):
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
              {result}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-800 dark:text-red-300">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
