"""
Solar Python Demo - Main API
A learning-focused FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import calculator, data

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


# Include routers
app.include_router(calculator.router)
app.include_router(data.router)
