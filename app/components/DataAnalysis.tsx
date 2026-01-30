"use client";
import { useState } from "react";

interface Statistics {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  count: number;
}

export default function DataAnalysis() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sampleSize, setSampleSize] = useState(100);

  const generateStats = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/data/statistics/numbers?count=${sampleSize}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError("Failed to connect to API. Is the Python backend running?");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Data Analysis with Pandas & NumPy
      </h3>

      <div className="space-y-4">
        {/* Controls */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Sample Size
            </label>
            <input
              type="number"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              min="10"
              max="10000"
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={generateStats}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate Stats"}
          </button>
        </div>

        {/* Statistics Display */}
        {stats && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                Mean
              </div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-200">
                {stats.mean.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">
                Median
              </div>
              <div className="text-lg font-bold text-green-900 dark:text-green-200">
                {stats.median.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                Std Dev
              </div>
              <div className="text-lg font-bold text-purple-900 dark:text-purple-200">
                {stats.std.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                Min
              </div>
              <div className="text-lg font-bold text-orange-900 dark:text-orange-200">
                {stats.min.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="text-xs text-red-600 dark:text-red-400 mb-1">
                Max
              </div>
              <div className="text-lg font-bold text-red-900 dark:text-red-200">
                {stats.max.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                Count
              </div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-200">
                {stats.count}
              </div>
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

        {/* Info Text */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Generates random numbers from a normal distribution (μ=100, σ=15) and
          calculates statistics using NumPy.
        </p>
      </div>
    </div>
  );
}
