import Link from "next/link";
import ApiStatus from "./components/ApiStatus";
import Calculator from "./components/Calculator";
import DataAnalysis from "./components/DataAnalysis";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-blue-50 dark:from-zinc-950 dark:via-black dark:to-blue-950">
      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 max-w-6xl">
        <div className="text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Learning Project
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-linear-to-r from-zinc-900 via-blue-800 to-zinc-900 dark:from-zinc-100 dark:via-blue-400 dark:to-zinc-100 bg-clip-text text-transparent">
            Solar Python Demo
          </h1>

          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Master Python from beginner to advanced by building a{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              full-stack application
            </span>{" "}
            with Next.js and FastAPI
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link
              href="#getting-started"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
            >
              Start Learning
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 text-zinc-900 dark:text-zinc-100 font-semibold rounded-lg transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20" id="features">
          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
              Structured Learning Path
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              5 progressive levels from Python basics to advanced topics like
              ML, async operations, and real-time features.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
              Hands-On Integration
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Build real REST APIs with FastAPI and connect them to a modern
              Next.js frontend with TypeScript.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
              Best Practices Included
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Learn testing with pytest, proper project structure, virtual
              environments, and production-ready patterns.
            </p>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mb-20" id="getting-started">
          <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900 dark:text-zinc-100">
            Quick Start Guide
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl bg-linear-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-zinc-900 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Frontend Setup
                </h3>
              </div>
              <div className="bg-zinc-900 dark:bg-black rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
                <div className="text-green-400"># Install dependencies</div>
                <div>npm install</div>
                <div className="text-green-400 mt-2"># Start dev server</div>
                <div>npm run dev</div>
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Next.js frontend runs on{" "}
                <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded">
                  http://localhost:3000
                </code>
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-linear-to-br from-green-50 to-white dark:from-green-950/30 dark:to-zinc-900 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Python Backend
                </h3>
              </div>
              <div className="bg-zinc-900 dark:bg-black rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
                <div className="text-green-400"># Create virtual env</div>
                <div>python -m venv .venv</div>
                <div className="text-green-400 mt-2"># Install FastAPI</div>
                <div>pip install fastapi uvicorn</div>
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Python API runs on{" "}
                <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded">
                  http://localhost:8000
                </code>
              </p>
            </div>
          </div>

          {/* Demo Components */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <ApiStatus />
            <Calculator />
          </div>

          {/* Data Analysis Component */}
          <DataAnalysis />
        </div>

        {/* Learning Path */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900 dark:text-zinc-100">
            Your Learning Journey
          </h2>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                level: "Level 1",
                title: "Python Fundamentals",
                weeks: "Week 1-2",
                topics: "Variables, functions, data types, control flow",
              },
              {
                level: "Level 2",
                title: "FastAPI Basics",
                weeks: "Week 3-4",
                topics: "REST APIs, Pydantic models, routing, validation",
              },
              {
                level: "Level 3",
                title: "Data Processing",
                weeks: "Week 5-6",
                topics: "pandas, numpy, data analysis, visualization",
              },
              {
                level: "Level 4",
                title: "Database Integration",
                weeks: "Week 7-8",
                topics: "SQLAlchemy, CRUD operations, relationships",
              },
              {
                level: "Level 5",
                title: "Advanced Topics",
                weeks: "Week 9+",
                topics: "Async, WebSockets, caching, authentication, ML",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </h3>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {item.weeks}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                      {item.topics}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center p-12 rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Python Journey?
          </h2>
          <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
            Follow the comprehensive README for detailed setup instructions,
            code examples, and resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/yourusername/solar-python-demo#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Read Documentation
            </a>
            <a
              href="https://fastapi.tiangolo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              FastAPI Docs
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <p>Built with Next.js, FastAPI, and ❤️ for learning</p>
      </footer>
    </div>
  );
}
