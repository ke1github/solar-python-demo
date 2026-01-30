# Solar Python Demo - Implementation Guide

A step-by-step guide to building your Next.js + Python integration from scratch. Follow each phase sequentially to build a complete full-stack application.

---

## 📋 Table of Contents

- [Phase 0: Prerequisites & Setup](#phase-0-prerequisites--setup)
- [Phase 1: Python Backend Foundation](#phase-1-python-backend-foundation)
- [Phase 2: First API Integration](#phase-2-first-api-integration)
- [Phase 3: Testing & Validation](#phase-3-testing--validation)
- [Phase 4: Data Processing](#phase-4-data-processing)
- [Phase 5: Database Integration](#phase-5-database-integration)
- [Phase 6: Advanced Features](#phase-6-advanced-features)
- [Phase 7: Production Ready](#phase-7-production-ready)

---

## Phase 0: Prerequisites & Setup

**Goal:** Ensure your development environment is ready.

### ✅ Checklist

- [ ] Node.js 20+ installed
- [ ] Python 3.10+ installed
- [ ] Git configured
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/PowerShell access

### 🔧 Verification

```bash
# Check versions
node --version    # Should be v20+
python --version  # Should be 3.10+
git --version     # Any recent version
```

### 📁 Project Structure Confirmation

Your current structure:

```
solar-python-demo/
└── my-app/              # ✅ Next.js frontend (done)
    ├── app/
    ├── public/
    └── package.json
```

Next, you'll create:

```
solar-python-demo/
├── my-app/              # ✅ Existing
└── python-api/          # 🔨 To be created
```

---

## Phase 1: Python Backend Foundation

**Goal:** Create a working FastAPI backend with basic endpoints.

### Step 1.1: Create Python Project Structure

```bash
# From project root (E:\Web-Apps\solar-python-demo)
cd ..                    # Go to project root if you're in my-app
mkdir python-api
cd python-api
```

### Step 1.2: Create Virtual Environment

**Windows:**

```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS/Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

You should see `(.venv)` in your terminal prompt.

### Step 1.3: Install Core Dependencies

```bash
pip install fastapi uvicorn[standard] pytest httpx python-multipart
pip freeze > requirements.txt
```

### Step 1.4: Create Main API File

Create `python-api/main.py`:

```python
"""
Solar Python Demo - Main API
A learning-focused FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

### Step 1.5: Create .gitignore

Create `python-api/.gitignore`:

```
# Virtual Environment
.venv/
venv/
ENV/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Testing
.pytest_cache/
.coverage
htmlcov/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite
*.sqlite3

# Environment variables
.env
.env.local
```

### Step 1.6: Start the Server

```bash
uvicorn main:app --reload --port 8000
```

### ✅ Phase 1 Verification

- [ ] Server starts without errors
- [ ] Visit http://localhost:8000 - see welcome message
- [ ] Visit http://localhost:8000/docs - see interactive API docs
- [ ] Visit http://localhost:8000/health - see health status

**Expected Output:**

```json
{
  "status": "healthy",
  "service": "python-api"
}
```

---

## Phase 2: First API Integration

**Goal:** Connect Next.js frontend to Python backend.

### Step 2.1: Create API Status Component

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

### Step 2.2: Create Calculator Example

Create `python-api/routers/calculator.py`:

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

### Step 2.3: Update main.py to Include Router

Update `python-api/main.py`:

```python
# Add after imports
from routers import calculator

# Add after CORS configuration
app.include_router(calculator.router)
```

### Step 2.4: Create Calculator UI Component

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

### ✅ Phase 2 Verification

- [ ] Calculator component renders
- [ ] Can perform calculations
- [ ] Results display correctly
- [ ] Error handling works (try divide by zero)
- [ ] Both servers running (3000/3001 and 8000)

---

## Phase 3: Testing & Validation

**Goal:** Add automated tests for reliability.

### Step 3.1: Create Test Directory

```bash
cd python-api
mkdir tests
```

### Step 3.2: Create Test Files

Create `python-api/tests/__init__.py`:

```python
# Empty file to make tests a package
```

Create `python-api/tests/test_main.py`:

```python
"""Tests for main API endpoints"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert "version" in data


def test_health_check():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "python-api"


def test_api_info():
    """Test API info endpoint"""
    response = client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert isinstance(data["features"], list)
```

Create `python-api/tests/test_calculator.py`:

```python
"""Tests for calculator endpoints"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_addition():
    """Test addition operation"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": 10, "y": 5, "operation": "add"}
    )
    assert response.status_code == 200
    assert response.json()["result"] == 15


def test_subtraction():
    """Test subtraction operation"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": 10, "y": 5, "operation": "subtract"}
    )
    assert response.status_code == 200
    assert response.json()["result"] == 5


def test_multiplication():
    """Test multiplication operation"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": 10, "y": 5, "operation": "multiply"}
    )
    assert response.status_code == 200
    assert response.json()["result"] == 50


def test_division():
    """Test division operation"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": 10, "y": 5, "operation": "divide"}
    )
    assert response.status_code == 200
    assert response.json()["result"] == 2


def test_division_by_zero():
    """Test division by zero error handling"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": 10, "y": 0, "operation": "divide"}
    )
    assert response.status_code == 400


def test_invalid_operation():
    """Test invalid operation error handling"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": 10, "y": 5, "operation": "invalid"}
    )
    assert response.status_code == 400


def test_list_operations():
    """Test operations list endpoint"""
    response = client.get("/api/calculator/operations")
    assert response.status_code == 200
    data = response.json()
    assert "operations" in data
    assert "add" in data["operations"]
```

### Step 3.3: Run Tests

```bash
pytest tests/ -v
```

### Step 3.4: Add Test Coverage

```bash
pip install pytest-cov
pytest tests/ --cov=. --cov-report=html
```

### ✅ Phase 3 Verification

- [ ] All tests pass
- [ ] Coverage report generated
- [ ] No warnings or errors

---

## Phase 4: Data Processing

**Goal:** Add data processing capabilities with pandas.

### Step 4.1: Install Data Science Libraries

```bash
pip install pandas numpy
pip freeze > requirements.txt
```

### Step 4.2: Create Data Processing Router

Create `python-api/routers/data.py`:

```python
"""Data processing endpoints"""
from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
from typing import List, Dict

router = APIRouter(prefix="/api/data", tags=["data"])


class SalesData(BaseModel):
    month: str
    sales: float
    expenses: float


class DataSummary(BaseModel):
    total_sales: float
    total_expenses: float
    total_profit: float
    average_sales: float
    best_month: str


@router.post("/analyze", response_model=DataSummary)
def analyze_sales(data: List[SalesData]):
    """Analyze sales data and return summary"""
    # Convert to pandas DataFrame
    df = pd.DataFrame([item.dict() for item in data])

    # Calculate profit
    df['profit'] = df['sales'] - df['expenses']

    # Find best performing month
    best_month = df.loc[df['profit'].idxmax(), 'month']

    return DataSummary(
        total_sales=float(df['sales'].sum()),
        total_expenses=float(df['expenses'].sum()),
        total_profit=float(df['profit'].sum()),
        average_sales=float(df['sales'].mean()),
        best_month=best_month
    )


@router.get("/sample")
def get_sample_data():
    """Get sample sales data"""
    return {
        "data": [
            {"month": "Jan", "sales": 15000, "expenses": 12000},
            {"month": "Feb", "sales": 18000, "expenses": 13000},
            {"month": "Mar", "sales": 22000, "expenses": 14000},
            {"month": "Apr", "sales": 19000, "expenses": 13500},
        ]
    }
```

### Step 4.3: Add Router to main.py

```python
from routers import calculator, data

app.include_router(calculator.router)
app.include_router(data.router)
```

### ✅ Phase 4 Verification

- [ ] Can POST sales data to `/api/data/analyze`
- [ ] GET sample data works
- [ ] Analysis returns correct calculations

---

## Phase 5: Database Integration

**Goal:** Add SQLite database with SQLAlchemy.

### Step 5.1: Install Database Dependencies

```bash
pip install sqlalchemy databases aiosqlite
pip freeze > requirements.txt
```

### Step 5.2: Create Database Models

Create `python-api/database.py`:

```python
"""Database configuration and models"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database URL
DATABASE_URL = "sqlite:///./solar_demo.db"

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    completed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 5.3: Create CRUD Router

Create `python-api/routers/tasks.py`:

```python
"""Task CRUD operations"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database import get_db, Task

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str
    description: str


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    completed: bool

    class Config:
        from_attributes = True


@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    db_task = Task(title=task.title, description=task.description)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/", response_model=List[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    """List all tasks"""
    tasks = db.query(Task).all()
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db)):
    """Mark task as complete"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = 1
    db.commit()
    return {"message": "Task completed"}


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
```

### Step 5.4: Initialize Database

Update `python-api/main.py`:

```python
from database import init_db
from routers import calculator, data, tasks

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(calculator.router)
app.include_router(data.router)
app.include_router(tasks.router)
```

### ✅ Phase 5 Verification

- [ ] Database file created
- [ ] Can create tasks
- [ ] Can list, update, delete tasks
- [ ] Check http://localhost:8000/docs for new endpoints

---

## Phase 6: Advanced Features

**Goal:** Add authentication, WebSockets, and background tasks.

### Coming Soon

- JWT authentication
- WebSocket real-time updates
- Background job processing
- File uploads
- Email notifications

---

## Phase 7: Production Ready

**Goal:** Prepare for deployment.

### Coming Soon

- Docker configuration
- Environment variables
- Logging and monitoring
- Rate limiting
- Security best practices
- CI/CD pipeline

---

## 📝 Progress Tracking

Mark your progress as you complete each phase:

- [x] Phase 0: Prerequisites & Setup ✅ COMPLETE
- [x] Phase 1: Python Backend Foundation ✅ COMPLETE
- [x] Phase 2: First API Integration ✅ COMPLETE
- [x] Phase 3: Testing & Validation ✅ COMPLETE
- [x] Phase 4: Data Processing ✅ COMPLETE
- [x] Phase 5: Database Integration ✅ COMPLETE
- [ ] Phase 6: Advanced Features (NEXT)
- [ ] Phase 7: Production Ready

---

## 🆘 Getting Help

- Check the main [README.md](README.md) for setup instructions
- Review [.github/copilot-instructions.md](.github/copilot-instructions.md) for AI coding guidelines
- FastAPI docs: https://fastapi.tiangolo.com
- Open an issue on GitHub

---

**Happy Building! 🚀**
