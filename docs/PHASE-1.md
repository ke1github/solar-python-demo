# Phase 1: Python Backend Foundation

**Goal:** Create a working FastAPI backend with basic endpoints.

**Time:** 30-45 minutes  
**Status:** ✅ COMPLETE

---

## What You'll Build

- Python virtual environment
- FastAPI application with CORS
- Three REST API endpoints
- Interactive API documentation

---

## Step 1.1: Create Python Project Structure

```bash
# From project root (E:\Web-Apps\solar-python-demo)
cd python-api  # or mkdir python-api && cd python-api
```

**Verification:**

```bash
pwd  # Should show: E:\Web-Apps\solar-python-demo\python-api
```

---

## Step 1.2: Create Virtual Environment

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

**Expected result:** You should see `(.venv)` in your terminal prompt.

**Verification:**

```bash
python --version  # Should show Python 3.10+
which python      # Should point to .venv/Scripts/python
```

---

## Step 1.3: Install Core Dependencies

```bash
pip install fastapi "uvicorn[standard]" pytest httpx python-multipart
```

**What each package does:**

- `fastapi` - Modern web framework
- `uvicorn` - ASGI server to run FastAPI
- `pytest` - Testing framework
- `httpx` - HTTP client for testing
- `python-multipart` - For file upload support

**Save dependencies:**

```bash
pip freeze > requirements.txt
```

**Verification:**

```bash
pip list | findstr fastapi  # Windows
pip list | grep fastapi     # macOS/Linux
```

---

## Step 1.4: Create Main API File

Create `main.py` in `python-api/`:

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

**Code explanation:**

- `FastAPI()` - Creates the application instance with metadata
- `add_middleware(CORSMiddleware)` - Allows frontend to call this API
- `@app.get("/")` - Decorator defines a GET endpoint at root path
- Docstrings - Automatically appear in API documentation

---

## Step 1.5: Create .gitignore

Create `.gitignore` in `python-api/`:

```gitignore
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

---

## Step 1.6: Start the Server

**Using venv python directly (recommended):**

```bash
# Windows
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

# macOS/Linux
.venv/bin/python -m uvicorn main:app --reload --port 8000
```

**Or activate venv first:**

```bash
# Activate
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Then run
uvicorn main:app --reload --port 8000
```

**Expected output:**

```
INFO:     Will watch for changes in these directories: ['E:\\...\\python-api']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [67890]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## ✅ Phase 1 Verification Checklist

Test each endpoint:

### 1. Root Endpoint

```bash
# In browser or curl
http://localhost:8000
```

**Expected response:**

```json
{
  "message": "Welcome to Solar Python API!",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. Health Check

```bash
http://localhost:8000/health
```

**Expected response:**

```json
{
  "status": "healthy",
  "service": "python-api"
}
```

### 3. API Info

```bash
http://localhost:8000/api/info
```

**Expected response:**

```json
{
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

### 4. Interactive API Documentation

Visit: **http://localhost:8000/docs**

You should see:

- ✅ Swagger UI with all endpoints listed
- ✅ "Try it out" buttons for testing
- ✅ Request/response schemas
- ✅ Your API title and description

### 5. Alternative Documentation

Visit: **http://localhost:8000/redoc**

You should see:

- ✅ ReDoc interface (cleaner, read-only documentation)

---

## 📁 Your Project Structure Now

```
solar-python-demo/
├── my-app/                    # Next.js frontend
│   └── ...
└── python-api/                # ✅ Python backend (complete)
    ├── .venv/                 # Virtual environment
    ├── main.py                # FastAPI application
    ├── requirements.txt       # Python dependencies
    └── .gitignore            # Git ignore rules
```

---

## 🎓 What You Learned

### FastAPI Concepts:

- **Application instance** - `app = FastAPI()`
- **Decorators** - `@app.get()`, `@app.post()`
- **Path operations** - Functions that handle routes
- **Automatic docs** - Generated from code and docstrings

### Python Concepts:

- **Virtual environments** - Isolated dependencies
- **Package management** - pip and requirements.txt
- **Type hints** - Better code documentation
- **Docstrings** - Multi-line comments for documentation

### Web Development:

- **CORS** - Cross-Origin Resource Sharing for frontend/backend
- **REST API** - Representational State Transfer
- **HTTP methods** - GET, POST, PUT, DELETE
- **JSON** - JavaScript Object Notation for data exchange

---

## 🐛 Common Issues

### Issue: `python: command not found`

**Solution:** Install Python or use `python3` command

### Issue: `ModuleNotFoundError: No module named 'fastapi'`

**Solution:** Activate virtual environment and install dependencies:

```bash
.venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: `Address already in use`

**Solution:** Port 8000 is occupied. Either:

- Stop the other process
- Use a different port: `--port 8001`

### Issue: `uvicorn: command not found`

**Solution:** Use python module syntax:

```bash
python -m uvicorn main:app --reload --port 8000
```

---

## 📝 Commit Your Work

```bash
cd python-api
git add .
git commit -m "feat: Complete Phase 1 - Python backend foundation

- Set up virtual environment with Python 3.10+
- Install FastAPI and core dependencies
- Create main.py with three endpoints (root, health, info)
- Configure CORS for Next.js frontend integration
- Add .gitignore for Python project"
```

---

## 🎯 Next Steps

✅ **Phase 1 Complete!**

Move to [PHASE-2.md](PHASE-2.md) to:

- Create React components
- Connect frontend to backend
- Build a calculator example
- See real-time API integration

---

**Keep your server running!** Leave this terminal open and open a new one for Phase 2.
