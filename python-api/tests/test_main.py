"""Tests for main API endpoints"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_endpoint():
    """Test the root endpoint returns welcome message"""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Welcome to Solar Python API!"
    assert data["version"] == "1.0.0"
    assert data["status"] == "running"


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "python-api"


def test_api_info():
    """Test the API info endpoint"""
    response = client.get("/api/info")
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Solar Python API"
    assert data["purpose"] == "Learning Python with FastAPI"
    assert "features" in data
    assert isinstance(data["features"], list)
    assert len(data["features"]) > 0


def test_404_not_found():
    """Test that invalid endpoints return 404"""
    response = client.get("/nonexistent")
    
    assert response.status_code == 404
