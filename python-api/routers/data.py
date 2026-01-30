"""Data processing endpoints using pandas and numpy"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/data", tags=["data"])


class SalesData(BaseModel):
    """Sales data model"""
    date: str
    product: str
    quantity: int
    price: float


class StatisticsResponse(BaseModel):
    """Statistics response model"""
    mean: float
    median: float
    std: float
    min: float
    max: float
    count: int


@router.post("/sales/analyze", response_model=Dict)
def analyze_sales(sales: List[SalesData]):
    """Analyze sales data with pandas"""
    if not sales:
        raise HTTPException(status_code=400, detail="No sales data provided")
    
    # Convert to DataFrame
    df = pd.DataFrame([sale.model_dump() for sale in sales])
    
    # Calculate revenue
    df['revenue'] = df['quantity'] * df['price']
    
    # Group by product
    product_summary = df.groupby('product').agg({
        'quantity': 'sum',
        'revenue': 'sum'
    }).to_dict('index')
    
    # Overall statistics
    total_revenue = df['revenue'].sum()
    total_quantity = df['quantity'].sum()
    avg_price = df['price'].mean()
    
    return {
        "total_revenue": float(total_revenue),
        "total_quantity": int(total_quantity),
        "average_price": float(avg_price),
        "product_summary": product_summary,
        "record_count": len(df)
    }


@router.get("/sales/demo")
def get_demo_sales():
    """Generate demo sales data"""
    # Create sample data
    products = ["Laptop", "Mouse", "Keyboard", "Monitor"]
    dates = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    
    data = []
    for date in dates:
        for product in products:
            data.append({
                "date": date,
                "product": product,
                "quantity": int(np.random.randint(1, 20)),
                "price": float(np.random.uniform(10, 1000))
            })
    
    return {"sales_data": data, "count": len(data)}


@router.get("/statistics/numbers")
def generate_statistics(count: int = 100):
    """Generate random numbers and calculate statistics"""
    if count < 1 or count > 10000:
        raise HTTPException(status_code=400, detail="Count must be between 1 and 10000")
    
    # Generate random numbers
    numbers = np.random.normal(100, 15, count)
    
    # Calculate statistics
    stats = {
        "mean": float(np.mean(numbers)),
        "median": float(np.median(numbers)),
        "std": float(np.std(numbers)),
        "min": float(np.min(numbers)),
        "max": float(np.max(numbers)),
        "count": count,
        "quartiles": {
            "q1": float(np.percentile(numbers, 25)),
            "q2": float(np.percentile(numbers, 50)),
            "q3": float(np.percentile(numbers, 75))
        }
    }
    
    return stats


@router.post("/statistics/analyze")
def analyze_numbers(numbers: List[float]):
    """Analyze a list of numbers"""
    if not numbers:
        raise HTTPException(status_code=400, detail="No numbers provided")
    
    arr = np.array(numbers)
    
    return {
        "mean": float(np.mean(arr)),
        "median": float(np.median(arr)),
        "std": float(np.std(arr)),
        "min": float(np.min(arr)),
        "max": float(np.max(arr)),
        "count": len(arr),
        "sum": float(np.sum(arr)),
        "variance": float(np.var(arr))
    }


@router.get("/chart/data")
def get_chart_data():
    """Generate data for charts"""
    # Time series data
    dates = pd.date_range(start='2026-01-01', periods=30, freq='D')
    values = np.cumsum(np.random.randn(30)) + 100
    
    return {
        "labels": [date.strftime("%Y-%m-%d") for date in dates],
        "values": values.tolist(),
        "type": "time_series"
    }


@router.post("/trend/predict")
def predict_trend(data_points: List[float]):
    """Simple trend prediction using numpy"""
    if len(data_points) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 data points")
    
    # Create x values (indices)
    x = np.arange(len(data_points))
    y = np.array(data_points)
    
    # Fit linear trend
    coefficients = np.polyfit(x, y, 1)
    trend_line = np.poly1d(coefficients)
    
    # Predict next 3 values
    future_x = np.arange(len(data_points), len(data_points) + 3)
    predictions = trend_line(future_x)
    
    return {
        "slope": float(coefficients[0]),
        "intercept": float(coefficients[1]),
        "predictions": predictions.tolist(),
        "trend": "increasing" if coefficients[0] > 0 else "decreasing"
    }
