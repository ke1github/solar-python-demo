"""Tests for data processing endpoints"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestSalesAnalysis:
    """Tests for sales analysis endpoint"""
    
    def test_analyze_sales_success(self):
        """Test successful sales analysis"""
        sales_data = [
            {"date": "2026-01-01", "product": "Laptop", "quantity": 5, "price": 1000},
            {"date": "2026-01-02", "product": "Mouse", "quantity": 10, "price": 50},
            {"date": "2026-01-03", "product": "Laptop", "quantity": 3, "price": 1000}
        ]
        
        response = client.post("/api/data/sales/analyze", json=sales_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_revenue" in data
        assert "total_quantity" in data
        assert "product_summary" in data
        assert data["total_quantity"] == 18
        assert data["record_count"] == 3
    
    def test_analyze_empty_sales(self):
        """Test analyzing empty sales data"""
        response = client.post("/api/data/sales/analyze", json=[])
        assert response.status_code == 400
        assert "No sales data provided" in response.json()["detail"]


class TestDemoData:
    """Tests for demo data generation"""
    
    def test_get_demo_sales(self):
        """Test demo sales data generation"""
        response = client.get("/api/data/sales/demo")
        assert response.status_code == 200
        
        data = response.json()
        assert "sales_data" in data
        assert "count" in data
        assert len(data["sales_data"]) > 0
        
        # Check structure of first item
        first_sale = data["sales_data"][0]
        assert "date" in first_sale
        assert "product" in first_sale
        assert "quantity" in first_sale
        assert "price" in first_sale


class TestStatistics:
    """Tests for statistics endpoints"""
    
    def test_generate_statistics_default(self):
        """Test statistics generation with default count"""
        response = client.get("/api/data/statistics/numbers")
        assert response.status_code == 200
        
        data = response.json()
        assert "mean" in data
        assert "median" in data
        assert "std" in data
        assert "min" in data
        assert "max" in data
        assert data["count"] == 100
    
    def test_generate_statistics_custom_count(self):
        """Test statistics with custom count"""
        response = client.get("/api/data/statistics/numbers?count=50")
        assert response.status_code == 200
        assert response.json()["count"] == 50
    
    def test_generate_statistics_invalid_count(self):
        """Test statistics with invalid count"""
        response = client.get("/api/data/statistics/numbers?count=20000")
        assert response.status_code == 400
    
    def test_analyze_numbers(self):
        """Test analyzing a list of numbers"""
        numbers = [10, 20, 30, 40, 50]
        response = client.post("/api/data/statistics/analyze", json=numbers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["mean"] == 30.0
        assert data["count"] == 5
        assert data["sum"] == 150.0
    
    def test_analyze_empty_numbers(self):
        """Test analyzing empty list"""
        response = client.post("/api/data/statistics/analyze", json=[])
        assert response.status_code == 400


class TestChartData:
    """Tests for chart data generation"""
    
    def test_get_chart_data(self):
        """Test chart data generation"""
        response = client.get("/api/data/chart/data")
        assert response.status_code == 200
        
        data = response.json()
        assert "labels" in data
        assert "values" in data
        assert "type" in data
        assert len(data["labels"]) == 30
        assert len(data["values"]) == 30


class TestTrendPrediction:
    """Tests for trend prediction"""
    
    def test_predict_trend_increasing(self):
        """Test trend prediction with increasing data"""
        data_points = [10, 20, 30, 40, 50]
        response = client.post("/api/data/trend/predict", json=data_points)
        
        assert response.status_code == 200
        result = response.json()
        assert "slope" in result
        assert "predictions" in result
        assert result["trend"] == "increasing"
        assert len(result["predictions"]) == 3
    
    def test_predict_trend_decreasing(self):
        """Test trend prediction with decreasing data"""
        data_points = [50, 40, 30, 20, 10]
        response = client.post("/api/data/trend/predict", json=data_points)
        
        assert response.status_code == 200
        result = response.json()
        assert result["trend"] == "decreasing"
    
    def test_predict_trend_insufficient_data(self):
        """Test trend prediction with insufficient data"""
        response = client.post("/api/data/trend/predict", json=[10])
        assert response.status_code == 400
