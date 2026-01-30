"""Tests for calculator API endpoints"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestCalculatorAddition:
    """Tests for addition endpoint"""
    
    def test_add_positive_numbers(self):
        """Test adding two positive numbers"""
        response = client.post(
            "/api/calculator/add",
            json={"a": 5, "b": 3}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 8
        assert data["operation"] == "addition"
    
    def test_add_negative_numbers(self):
        """Test adding negative numbers"""
        response = client.post(
            "/api/calculator/add",
            json={"a": -5, "b": -3}
        )
        assert response.status_code == 200
        assert response.json()["result"] == -8
    
    def test_add_decimal_numbers(self):
        """Test adding decimal numbers"""
        response = client.post(
            "/api/calculator/add",
            json={"a": 1.5, "b": 2.5}
        )
        assert response.status_code == 200
        assert response.json()["result"] == 4.0


class TestCalculatorSubtraction:
    """Tests for subtraction endpoint"""
    
    def test_subtract_positive_numbers(self):
        """Test subtracting two positive numbers"""
        response = client.post(
            "/api/calculator/subtract",
            json={"a": 10, "b": 4}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 6
        assert data["operation"] == "subtraction"
    
    def test_subtract_negative_result(self):
        """Test subtraction resulting in negative number"""
        response = client.post(
            "/api/calculator/subtract",
            json={"a": 3, "b": 8}
        )
        assert response.status_code == 200
        assert response.json()["result"] == -5


class TestCalculatorMultiplication:
    """Tests for multiplication endpoint"""
    
    def test_multiply_positive_numbers(self):
        """Test multiplying two positive numbers"""
        response = client.post(
            "/api/calculator/multiply",
            json={"a": 6, "b": 7}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 42
        assert data["operation"] == "multiplication"
    
    def test_multiply_by_zero(self):
        """Test multiplying by zero"""
        response = client.post(
            "/api/calculator/multiply",
            json={"a": 100, "b": 0}
        )
        assert response.status_code == 200
        assert response.json()["result"] == 0


class TestCalculatorDivision:
    """Tests for division endpoint"""
    
    def test_divide_positive_numbers(self):
        """Test dividing two positive numbers"""
        response = client.post(
            "/api/calculator/divide",
            json={"a": 20, "b": 4}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 5
        assert data["operation"] == "division"
    
    def test_divide_by_zero(self):
        """Test that dividing by zero returns error"""
        response = client.post(
            "/api/calculator/divide",
            json={"a": 10, "b": 0}
        )
        assert response.status_code == 400
        data = response.json()
        assert "Cannot divide by zero" in data["detail"]
    
    def test_divide_decimal_result(self):
        """Test division with decimal result"""
        response = client.post(
            "/api/calculator/divide",
            json={"a": 10, "b": 3}
        )
        assert response.status_code == 200
        assert round(response.json()["result"], 2) == 3.33


@pytest.mark.parametrize("operation,a,b,expected", [
    ("add", 2, 3, 5),
    ("add", -2, 3, 1),
    ("subtract", 10, 5, 5),
    ("subtract", 5, 10, -5),
    ("multiply", 3, 4, 12),
    ("multiply", -2, 3, -6),
    ("divide", 15, 3, 5),
    ("divide", 7, 2, 3.5),
])
def test_calculator_operations(operation, a, b, expected):
    """Parametrized test for all calculator operations"""
    response = client.post(
        f"/api/calculator/{operation}",
        json={"a": a, "b": b}
    )
    assert response.status_code == 200
    assert response.json()["result"] == expected


def test_invalid_input():
    """Test that invalid input is rejected"""
    response = client.post(
        "/api/calculator/add",
        json={"a": "not a number", "b": 5}
    )
    assert response.status_code == 422  # Validation error
