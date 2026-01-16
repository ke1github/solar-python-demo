# Phase 2: First API Integration

**Goal:** Connect Next.js frontend to Python backend with real-time status monitoring.

**Time:** 45-60 minutes  
**Status:** 🚧 IN PROGRESS

---

## What You'll Build

- API status monitoring component
- Calculator API endpoint in Python
- Calculator UI component in Next.js
- Real-time data flow between services

---

## Prerequisites

- ✅ Phase 1 complete (Python backend running)
- ✅ Next.js frontend running (`npm run dev`)
- Both servers must be running simultaneously

---

## Step 2.1: Create API Status Component

This component will show if your Python API is online.

Create `my-app/app/components/ApiStatus.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  service: string;
}

export default function ApiStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch("http://localhost:8000/health");
        const data = await response.json();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to connect");
      } finally {
        setLoading(false);
      }
    };

    checkApi();

    // Check every 30 seconds
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-500">
        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></div>
        Connecting...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        Python API Offline
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-500">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      Python API Connected
    </div>
  );
}
```

**What this does:**

- Fetches `/health` endpoint every 30 seconds
- Shows green indicator when connected
- Shows red indicator if Python API is offline
- Auto-reconnects when API comes back online

---

## Step 2.2: Create Calculator Router in Python

Create `python-api/routers/` directory and calculator module.

**Create `python-api/routers/__init__.py`:**

```python
# Empty file to make routers a package
```

**Create `python-api/routers/calculator.py`:**

```python
"""Calculator API endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/calculator", tags=["calculator"])


class CalculationRequest(BaseModel):
    x: float
    y: float
    operation: str


class CalculationResponse(BaseModel):
    x: float
    y: float
    operation: str
    result: float


@router.post("/calculate", response_model=CalculationResponse)
def calculate(request: CalculationRequest):
    """Perform basic math operations"""
    operations = {
        "add": request.x + request.y,
        "subtract": request.x - request.y,
        "multiply": request.x * request.y,
        "divide": request.x / request.y if request.y != 0 else None,
    }

    if request.operation not in operations:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid operation. Use: {', '.join(operations.keys())}"
        )

    result = operations[request.operation]

    if result is None:
        raise HTTPException(status_code=400, detail="Division by zero")

    return CalculationResponse(
        x=request.x,
        y=request.y,
        operation=request.operation,
        result=result
    )


@router.get("/operations")
def list_operations():
    """List available calculator operations"""
    return {
        "operations": ["add", "subtract", "multiply", "divide"],
        "description": "Basic arithmetic operations"
    }
```

---

## Step 2.3: Update main.py to Include Router

Update `python-api/main.py` by adding these lines:

```python
# Add this import at the top
from routers import calculator

# Add this after CORS middleware configuration
app.include_router(calculator.router)
```

**Full updated main.py should look like:**

```python
"""
Solar Python Demo - Main API
A learning-focused FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import calculator

# Initialize FastAPI app
app = FastAPI(
    title="Solar Python API",
    description="Learning project for Python + Next.js integration",
    version="1.0.0",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(calculator.router)


@app.get("/")
def root():
    """Root endpoint - API welcome message"""
    return {
        "message": "Welcome to Solar Python API!",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "python-api"
    }


@app.get("/api/info")
def api_info():
    """Get API information"""
    return {
        "name": "Solar Python API",
        "purpose": "Learning Python with FastAPI",
        "features": [
            "REST API endpoints",
            "Data processing",
            "Database integration",
            "Testing examples"
        ]
    }
```

**Restart your Python server** to load the new router (Ctrl+C, then run uvicorn again).

---

## Step 2.4: Test Calculator API

Visit http://localhost:8000/docs and test the calculator:

1. Expand `POST /api/calculator/calculate`
2. Click "Try it out"
3. Enter test data:
   ```json
   {
     "x": 10,
     "y": 5,
     "operation": "add"
   }
   ```
4. Click "Execute"
5. You should see result: `15`

---

## Step 2.5: Create Calculator UI Component

Create `my-app/app/components/Calculator.tsx`:

```typescript
"use client";
import { useState } from "react";

export default function Calculator() {
  const [x, setX] = useState("10");
  const [y, setY] = useState("5");
  const [operation, setOperation] = useState("add");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/calculator/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            x: parseFloat(x),
            y: parseFloat(y),
            operation,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail);
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-xl font-bold mb-4">Python Calculator</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            value={x}
            onChange={(e) => setX(e.target.value)}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            placeholder="First number"
          />
          <input
            type="number"
            value={y}
            onChange={(e) => setY(e.target.value)}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            placeholder="Second number"
          />
        </div>

        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
        >
          <option value="add">Add (+)</option>
          <option value="subtract">Subtract (-)</option>
          <option value="multiply">Multiply (×)</option>
          <option value="divide">Divide (÷)</option>
        </select>

        <button
          onClick={calculate}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {result !== null && !error && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Result:</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {result}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Step 2.6: Add Components to Landing Page

Update `my-app/app/page.tsx` to include the new components.

Add imports at the top:

```typescript
import ApiStatus from "./components/ApiStatus";
import Calculator from "./components/Calculator";
```

Add a demo section before the footer:

```typescript
{
  /* Demo Section - Add before footer */
}
<div className="mb-20">
  <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900 dark:text-zinc-100">
    Live Demo
  </h2>
  <div className="flex justify-center mb-8">
    <ApiStatus />
  </div>

  <div className="max-w-md mx-auto">
    <Calculator />
  </div>
</div>;
```

---

## ✅ Phase 2 Verification

Check that everything works:

- [ ] Python server running without errors
- [ ] Next.js server running without errors
- [ ] API status shows "Python API Connected" (green)
- [ ] Calculator component visible on homepage
- [ ] Can perform calculations (try 10 + 5 = 15)
- [ ] Error handling works (try dividing by 0)
- [ ] Check http://localhost:8000/docs - see calculator endpoints

---

## 🎉 Success!

You now have a working full-stack integration:

- Frontend calls backend via HTTP
- Real-time status monitoring
- Interactive calculator
- Error handling

**Next:** Move to Phase 3 for testing!

---

## 🐛 Troubleshooting

**Calculator not working?**

- Check both servers are running
- Verify CORS is configured in main.py
- Check browser console for errors

**API Status shows offline?**

- Restart Python server
- Check port 8000 is not blocked
- Verify `/health` endpoint works: http://localhost:8000/health

**Import errors in Python?**

- Create `__init__.py` in routers folder
- Restart Python server after changes
