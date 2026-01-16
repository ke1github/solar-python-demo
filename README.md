# Solar Python Demo - Next.js + Python Integration

A comprehensive learning project for integrating Python backends with Next.js frontends. Perfect for developers with no Python experience who want to learn from beginner to advanced level.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Python Learning Path](#python-learning-path)
- [Integration Examples](#integration-examples)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## 🎯 Project Overview

This project serves as a hands-on learning environment for:

- **Python fundamentals** from beginner to advanced
- **Backend development** with FastAPI
- **Frontend-backend integration** patterns
- **Full-stack development** workflows
- **Testing practices** for both Python and TypeScript

**Architecture Philosophy:** Keep Python and Next.js as separate, loosely-coupled services that communicate via HTTP APIs.

## 🛠 Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS 4** - Utility-first CSS

### Backend (To Be Created)

- **Python 3.10+** - Core language
- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **pytest** - Testing framework

## 📁 Project Structure

```
solar-python-demo/
├── my-app/                    # Next.js frontend (current folder)
│   ├── app/
│   │   ├── page.tsx          # Main page - edit here for UI
│   │   ├── layout.tsx        # Root layout with global setup
│   │   └── globals.css       # Global styles
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies & scripts
│   └── next.config.ts        # Next.js configuration
│
└── python-api/               # Python backend (to be created)
    ├── main.py               # FastAPI application
    ├── requirements.txt      # Python dependencies
    ├── tests/                # pytest tests
    ├── examples/             # Learning examples
    │   ├── basics/           # Python fundamentals
    │   ├── data_processing/  # pandas, numpy examples
    │   └── ml_models/        # Machine learning demos
    └── .venv/                # Virtual environment (created locally)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/)

### Step 1: Setup Frontend

```bash
# Navigate to the Next.js app
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at **http://localhost:3000**

### Step 2: Setup Python Backend

```bash
# Go back to project root
cd ..

# Create Python service directory
mkdir python-api
cd python-api

# Create virtual environment (Windows)
python -m venv .venv
.venv\Scripts\activate

# Create virtual environment (macOS/Linux)
python3 -m venv .venv
source .venv/bin/activate

# Install FastAPI and dependencies
pip install fastapi uvicorn pytest httpx

# Save dependencies
pip freeze > requirements.txt
```

### Step 3: Create Your First Python API

Create `python-api/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Solar Python API", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to Solar Python API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "python-api"}

@app.get("/api/calculate")
def calculate(x: int, y: int, operation: str = "add"):
    """Simple calculator endpoint"""
    operations = {
        "add": x + y,
        "subtract": x - y,
        "multiply": x * y,
        "divide": x / y if y != 0 else None
    }
    result = operations.get(operation)
    return {"x": x, "y": y, "operation": operation, "result": result}
```

Start the Python server:

```bash
# Make sure you're in python-api/ with venv activated
uvicorn main:app --reload --port 8000
```

Backend will be available at **http://localhost:8000**

Test it: Open **http://localhost:8000/docs** to see interactive API documentation!

### Step 4: Connect Frontend to Backend

Update `my-app/app/page.tsx` to fetch from Python API:

```typescript
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface HealthResponse {
  status: string;
  service: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 p-8">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <h1 className="text-4xl font-bold">Solar Python Demo</h1>

        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Python API Status</h2>
          {loading && <p>Connecting to Python backend...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {health && (
            <div className="space-y-2">
              <p className="text-green-600 dark:text-green-400">
                ✓ Connected successfully!
              </p>
              <p>
                Status: <code>{health.status}</code>
              </p>
              <p>
                Service: <code>{health.service}</code>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

**Restart your frontend** (`npm run dev`) and you should see the Python API status!

## 📚 Python Learning Path

### Level 1: Python Fundamentals (Week 1-2)

Create `python-api/examples/basics/01_variables.py`:

```python
# Variables and data types
name = "Solar Python"
age = 1
is_learning = True
price = 29.99

# Lists
frameworks = ["FastAPI", "Django", "Flask"]

# Dictionaries
user = {"name": "Developer", "role": "Full Stack"}

# Functions
def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
```

Run it: `python examples/basics/01_variables.py`

**Learning Goals:**

- Variables and data types
- Control flow (if/else, loops)
- Functions and parameters
- Lists, dictionaries, sets
- File I/O basics

### Level 2: FastAPI Basics (Week 3-4)

Create `python-api/examples/fastapi_basics/simple_crud.py`:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Data model
class Item(BaseModel):
    id: int
    name: str
    price: float

# In-memory database
items_db = []

@app.post("/items")
def create_item(item: Item):
    items_db.append(item)
    return {"message": "Item created", "item": item}

@app.get("/items")
def list_items():
    return {"items": items_db}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    for item in items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")
```

**Learning Goals:**

- REST API concepts
- Request/response models with Pydantic
- Path and query parameters
- HTTP methods (GET, POST, PUT, DELETE)
- Error handling

### Level 3: Data Processing (Week 5-6)

Create `python-api/examples/data_processing/pandas_demo.py`:

```python
import pandas as pd
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/data/summary")
def get_data_summary():
    # Create sample data
    data = {
        "month": ["Jan", "Feb", "Mar", "Apr"],
        "sales": [15000, 18000, 22000, 19000],
        "expenses": [12000, 13000, 14000, 13500]
    }
    df = pd.DataFrame(data)

    # Calculate profit
    df["profit"] = df["sales"] - df["expenses"]

    return {
        "data": df.to_dict(orient="records"),
        "total_sales": int(df["sales"].sum()),
        "total_profit": int(df["profit"].sum()),
        "avg_sales": float(df["sales"].mean())
    }
```

Install pandas: `pip install pandas`

**Learning Goals:**

- pandas DataFrames
- Data manipulation and analysis
- Working with CSV/JSON data
- Aggregations and statistics

### Level 4: Database Integration (Week 7-8)

```python
from fastapi import FastAPI
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database setup
DATABASE_URL = "sqlite:///./solar_demo.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Define model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)

Base.metadata.create_all(bind=engine)
```

**Learning Goals:**

- SQLAlchemy ORM
- Database models
- CRUD operations
- Relationships and joins

### Level 5: Advanced Topics (Week 9+)

- **Async/Await:** Non-blocking operations
- **Background Tasks:** Long-running processes
- **WebSockets:** Real-time communication
- **Caching:** Redis integration
- **Authentication:** JWT tokens
- **Machine Learning:** scikit-learn, TensorFlow basics

## 🔗 Integration Examples

### Example 1: Calculator API

**Backend** (`python-api/main.py`):

```python
@app.get("/api/calculate")
def calculate(x: float, y: float, op: str):
    ops = {"add": x+y, "sub": x-y, "mul": x*y, "div": x/y}
    return {"result": ops.get(op, 0)}
```

**Frontend** (`my-app/app/calculator/page.tsx`):

```typescript
const response = await fetch(
  `http://localhost:8000/api/calculate?x=10&y=5&op=add`
);
const data = await response.json();
console.log(data.result); // 15
```

### Example 2: Data Visualization

**Backend:** Return chart data

```python
@app.get("/api/chart-data")
def chart_data():
    return {
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "values": [45, 60, 80, 95]
    }
```

**Frontend:** Use with Chart.js or Recharts

```typescript
const { labels, values } = await fetch("/api/chart-data").then((r) => r.json());
// Render with your chart library
```

### Example 3: File Processing

**Backend:** Accept file uploads

```python
from fastapi import File, UploadFile

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    # Process the file
    return {"filename": file.filename, "size": len(contents)}
```

## 🧪 Testing

### Python Tests with pytest

Create `python-api/tests/test_main.py`:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_calculate():
    response = client.get("/api/calculate?x=10&y=5&operation=add")
    assert response.status_code == 200
    assert response.json()["result"] == 15
```

Run tests:

```bash
cd python-api
pytest tests/ -v
```

### Frontend Tests (Optional)

Install testing libraries:

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest
```

## 🔧 Troubleshooting

### Python API Not Starting

**Error:** `uvicorn: command not found`

- **Solution:** Activate virtual environment: `.venv\Scripts\activate`

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

- **Solution:** Install dependencies: `pip install -r requirements.txt`

### CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

- **Solution:** Ensure CORS middleware is configured in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Connection Refused

**Error:** `fetch failed: connection refused`

- **Solution:** Make sure Python API is running on port 8000: `uvicorn main:app --reload --port 8000`

### Port Already in Use

**Error:** `Address already in use`

- **Solution:** Change port: `uvicorn main:app --reload --port 8001`

## 📖 Resources

### Python Learning

- [Official Python Tutorial](https://docs.python.org/3/tutorial/)
- [Real Python](https://realpython.com/) - Comprehensive tutorials
- [Python for Everybody](https://www.py4e.com/) - Free course

### FastAPI

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Full Stack FastAPI Template](https://github.com/tiangolo/full-stack-fastapi-template)

### Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

### Testing

- [pytest Documentation](https://docs.pytest.org/)
- [Testing FastAPI](https://fastapi.tiangolo.com/tutorial/testing/)

## 🎓 Next Steps

1. **Complete the Quick Start** - Get both services running
2. **Work through Level 1 Python examples** - Build fundamentals
3. **Create your first custom endpoint** - Practice API design
4. **Build a small project** - Todo list, calculator, or data dashboard
5. **Explore advanced topics** - Database, authentication, real-time features

## 📝 Development Commands

### Frontend (my-app/)

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend (python-api/)

```bash
# Activate virtual environment
.venv\Scripts\activate              # Windows
source .venv/bin/activate           # macOS/Linux

# Run server
uvicorn main:app --reload --port 8000

# Run tests
pytest tests/ -v

# Check code style
pip install black flake8
black .
flake8 .
```

## 🤝 Contributing

This is a learning project! Feel free to:

- Add more Python examples
- Create new integration patterns
- Improve documentation
- Share your learning journey

## 📄 License

This project is for educational purposes.

---

**Happy Learning! 🚀** Start with the Quick Start guide and work your way through the Python Learning Path.
