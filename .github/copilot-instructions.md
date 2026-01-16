# Copilot / AI Agent Instructions

## Project Overview

- **Project root:** Next.js app at `my-app/` (see `package.json`)
- **Tech stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
- **Purpose:** Learning sandbox for integrating Python backend with Next.js frontend

## How to Run

- **Frontend dev:** `npm run dev` (starts on port 3000)
- **Build:** `npm run build` then `npm start` (production)
- **Lint:** `npm run lint` (ESLint configured)

## Big Picture Architecture

This is a minimal Next.js frontend with **no Python service yet**. The intended pattern:

- Keep Python backend as a **separate service** (suggested: `../python-api/` beside `my-app/`)
- Use **FastAPI** for Python (runs on port 8000)
- Frontend calls backend via standard HTTP fetch from components
- This separation keeps Next.js as UI layer and Python for computation/learning examples

## Python Integration Pattern

### Recommended Python Setup

Create a separate Python service at repo root:

```bash
# At repository root (beside my-app/)
mkdir python-api
cd python-api
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS/Linux
pip install fastapi uvicorn pytest
```

### Example Python Service (`python-api/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow Next.js dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Python API is running"}

@app.get("/api/calculate")
def calculate(x: int, y: int):
    return {"result": x + y}
```

Run with: `uvicorn main:app --reload --port 8000`

### Frontend Integration (`app/page.tsx`)

```typescript
// Example: Fetch from Python API in a client component
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((res) => res.json())
      .then((data) => setHealth(data));
  }, []);

  return (
    <div>
      <h1>Python API Status</h1>
      {health && <p>{health.message}</p>}
    </div>
  );
}
```

## Development Workflow

1. **Start frontend:** `cd my-app && npm run dev` → `http://localhost:3000`
2. **Start backend:** `cd python-api && .venv\Scripts\activate && uvicorn main:app --reload --port 8000` → `http://localhost:8000`
3. Frontend fetches from `http://localhost:8000/api/*` endpoints

## Code Conventions

### Frontend (Next.js)

- **UI code:** All under `app/` directory (App Router structure)
- **Main page:** `app/page.tsx` — edit here for demo UI changes
- **Layout:** `app/layout.tsx` — contains global setup (fonts, metadata)
- **Styles:** TailwindCSS classes (v4), global styles in `app/globals.css`
- **TypeScript types:** Create types for API responses in `my-app/types/` (create as needed)

### Backend (Python)

- **Keep isolated:** Python service in separate `python-api/` folder
- **Dependencies:** Use `requirements.txt` or `pyproject.toml`
- **Virtual env:** Always use `.venv` for isolation
- **Testing:** Use `pytest` for unit/integration tests
- **Examples:** Place learning scripts/notebooks in `python-api/examples/`

## Key Files to Reference

- `my-app/package.json` — Frontend scripts and dependencies
- `my-app/app/page.tsx` — Main UI entry point for demos
- `my-app/app/layout.tsx` — Root layout with global setup
- `my-app/next.config.ts` — Next.js configuration (currently minimal)
- `my-app/README.md` — Standard Next.js README (update after adding Python)

## Testing Strategy

### Python Tests

```bash
# Inside python-api/
pytest tests/
```

Create `python-api/tests/test_main.py`:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

### Optional: NPM Script for Python Tests

Add to `my-app/package.json`:

```json
"scripts": {
  "test:python": "cd ../python-api && .venv/Scripts/activate && pytest"
}
```

## What AI Agents Should Do

### Safe, Small Tasks

- Add fetch calls in `app/page.tsx` to demonstrate API integration
- Create sample Python endpoints in `python-api/main.py`
- Generate TypeScript interfaces matching Python response shapes
- Create example Python scripts for learning (calculations, data processing)

### Scaffold Python Service

When creating the Python backend:

1. Create `python-api/` folder at repo root (beside `my-app/`)
2. Add `requirements.txt` with dependencies
3. Create `main.py` with FastAPI app and CORS middleware
4. Add `tests/` folder with pytest examples
5. Include `.gitignore` for Python (`__pycache__`, `.venv`, etc.)

### What NOT to Do

- Don't install Python globally or in `my-app/` — keep separate
- Don't refactor entire Next.js app — keep changes minimal and scoped
- Don't add complex state management until basic integration works
- Don't modify build configuration without explicit request

## Learning Path for Python Beginners

This project structure supports progressive Python learning:

1. **Basics:** Simple functions in `python-api/examples/basics.py`
2. **FastAPI:** REST endpoints in `main.py`
3. **Testing:** Unit tests with pytest
4. **Data handling:** pandas/numpy examples calling from Next.js
5. **Advanced:** async endpoints, database integration, ML models

When adding learning examples, create separate files in `python-api/examples/` and document them in the Python service README.

---

**Need clarification?** Ask for:

- Full Python service scaffold with all files
- Specific Python learning examples (data processing, ML, etc.)
- Frontend components for visualizing Python results
- Docker setup for both services
