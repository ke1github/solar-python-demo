# Phase 4: Data Processing with pandas

**Goal:** Add data analysis capabilities using pandas and numpy.

**Time:** 45-60 minutes  
**Status:** ⏳ UPCOMING

---

## What You'll Build

- Data analysis API endpoints
- pandas DataFrame operations
- Sales data analysis example
- Chart data generation for frontend
- CSV file processing

---

## Prerequisites

- ✅ Phase 1, 2, 3 complete
- Python virtual environment activated
- Basic understanding of data analysis concepts

---

## Step 4.1: Install Data Science Libraries

```bash
cd python-api
# Activate virtual environment if not already active
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

pip install pandas numpy
pip freeze > requirements.txt
```

---

## Step 4.2: Create Data Processing Router

**Create `python-api/routers/data.py`:**

```python
"""Data processing endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from typing import List, Dict, Optional

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
    average_profit: float
    best_month: str
    worst_month: str
    profit_margin: float


class ChartData(BaseModel):
    labels: List[str]
    sales: List[float]
    expenses: List[float]
    profit: List[float]


@router.post("/analyze", response_model=DataSummary)
def analyze_sales(data: List[SalesData]):
    """Analyze sales data and return comprehensive summary"""
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")

    # Convert to pandas DataFrame
    df = pd.DataFrame([item.dict() for item in data])

    # Calculate profit
    df['profit'] = df['sales'] - df['expenses']

    # Calculate profit margin as percentage
    df['profit_margin'] = (df['profit'] / df['sales'] * 100).round(2)

    # Find best and worst performing months
    best_month = df.loc[df['profit'].idxmax(), 'month']
    worst_month = df.loc[df['profit'].idxmin(), 'month']

    # Calculate overall profit margin
    total_sales = float(df['sales'].sum())
    total_profit = float(df['profit'].sum())
    overall_margin = (total_profit / total_sales * 100) if total_sales > 0 else 0

    return DataSummary(
        total_sales=total_sales,
        total_expenses=float(df['expenses'].sum()),
        total_profit=total_profit,
        average_sales=float(df['sales'].mean()),
        average_profit=float(df['profit'].mean()),
        best_month=best_month,
        worst_month=worst_month,
        profit_margin=round(overall_margin, 2)
    )


@router.post("/chart-data", response_model=ChartData)
def generate_chart_data(data: List[SalesData]):
    """Generate data formatted for charts"""
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")

    df = pd.DataFrame([item.dict() for item in data])
    df['profit'] = df['sales'] - df['expenses']

    return ChartData(
        labels=df['month'].tolist(),
        sales=df['sales'].tolist(),
        expenses=df['expenses'].tolist(),
        profit=df['profit'].tolist()
    )


@router.get("/sample")
def get_sample_data():
    """Get sample sales data for testing"""
    return {
        "data": [
            {"month": "Jan", "sales": 15000, "expenses": 12000},
            {"month": "Feb", "sales": 18000, "expenses": 13000},
            {"month": "Mar", "sales": 22000, "expenses": 14000},
            {"month": "Apr", "sales": 19000, "expenses": 13500},
            {"month": "May", "sales": 25000, "expenses": 15000},
            {"month": "Jun", "sales": 28000, "expenses": 16000},
        ],
        "description": "6 months of sample sales data"
    }


@router.post("/statistics")
def calculate_statistics(data: List[SalesData]):
    """Calculate detailed statistics"""
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")

    df = pd.DataFrame([item.dict() for item in data])
    df['profit'] = df['sales'] - df['expenses']

    return {
        "sales": {
            "mean": float(df['sales'].mean()),
            "median": float(df['sales'].median()),
            "std": float(df['sales'].std()),
            "min": float(df['sales'].min()),
            "max": float(df['sales'].max()),
        },
        "expenses": {
            "mean": float(df['expenses'].mean()),
            "median": float(df['expenses'].median()),
            "std": float(df['expenses'].std()),
            "min": float(df['expenses'].min()),
            "max": float(df['expenses'].max()),
        },
        "profit": {
            "mean": float(df['profit'].mean()),
            "median": float(df['profit'].median()),
            "std": float(df['profit'].std()),
            "min": float(df['profit'].min()),
            "max": float(df['profit'].max()),
        },
        "growth_rate": float(
            ((df['sales'].iloc[-1] - df['sales'].iloc[0]) / df['sales'].iloc[0] * 100)
            if len(df) > 1 else 0
        )
    }


class TrendPrediction(BaseModel):
    next_month_sales: float
    confidence: str
    trend: str


@router.post("/predict-trend", response_model=TrendPrediction)
def predict_sales_trend(data: List[SalesData]):
    """Simple linear trend prediction"""
    if len(data) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 data points")

    df = pd.DataFrame([item.dict() for item in data])

    # Simple linear regression using numpy
    x = np.arange(len(df))
    y = df['sales'].values

    # Calculate slope (trend)
    slope = np.polyfit(x, y, 1)[0]

    # Predict next month
    next_month = float(y[-1] + slope)

    # Determine trend direction
    if slope > 500:
        trend = "strongly increasing"
        confidence = "high"
    elif slope > 0:
        trend = "increasing"
        confidence = "medium"
    elif slope > -500:
        trend = "decreasing"
        confidence = "medium"
    else:
        trend = "strongly decreasing"
        confidence = "high"

    return TrendPrediction(
        next_month_sales=round(next_month, 2),
        confidence=confidence,
        trend=trend
    )
```

---

## Step 4.3: Update main.py

Add the data router to your main application:

```python
from routers import calculator, data

# Include routers
app.include_router(calculator.router)
app.include_router(data.router)
```

Restart your Python server to load the changes.

---

## Step 4.4: Test Data Analysis API

Visit http://localhost:8000/docs and test:

1. **GET `/api/data/sample`** - Get sample data
2. **POST `/api/data/analyze`** - Analyze the sample data
3. **POST `/api/data/chart-data`** - Get chart-ready data
4. **POST `/api/data/statistics`** - Get detailed statistics
5. **POST `/api/data/predict-trend`** - Predict next month

**Example Test:**

```json
{
  "data": [
    { "month": "Jan", "sales": 15000, "expenses": 12000 },
    { "month": "Feb", "sales": 18000, "expenses": 13000 },
    { "month": "Mar", "sales": 22000, "expenses": 14000 }
  ]
}
```

---

## Step 4.5: Create Data Visualization Component

**Create `my-app/app/components/DataAnalysis.tsx`:**

```typescript
"use client";
import { useState } from "react";

interface SalesData {
  month: string;
  sales: number;
  expenses: number;
}

interface AnalysisResult {
  total_sales: number;
  total_expenses: number;
  total_profit: number;
  average_sales: number;
  average_profit: number;
  best_month: string;
  worst_month: string;
  profit_margin: number;
}

export default function DataAnalysis() {
  const [data, setData] = useState<SalesData[]>([
    { month: "Jan", sales: 15000, expenses: 12000 },
    { month: "Feb", sales: 18000, expenses: 13000 },
    { month: "Mar", sales: 22000, expenses: 14000 },
  ]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSampleData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/data/sample");
      const sample = await response.json();
      setData(sample.data);
    } catch (error) {
      console.error("Failed to load sample data:", error);
    }
  };

  const analyzeData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/data/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const analysis = await response.json();
      setResult(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-xl font-bold mb-4">Sales Data Analysis</h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={loadSampleData}
            className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg"
          >
            Load Sample Data
          </button>
          <button
            onClick={analyzeData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
          >
            {loading ? "Analyzing..." : "Analyze Data"}
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto border border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-2">Month</th>
                <th className="text-right py-2">Sales</th>
                <th className="text-right py-2">Expenses</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="py-2">{item.month}</td>
                  <td className="text-right">${item.sales.toLocaleString()}</td>
                  <td className="text-right">
                    ${item.expenses.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Total Sales
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ${result.total_sales.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Total Profit
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ${result.total_profit.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Profit Margin
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {result.profit_margin}%
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Best Month
              </p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {result.best_month}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Step 4.6: Write Tests for Data Processing

**Create `tests/test_data.py`:**

```python
"""Tests for data processing endpoints"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

sample_data = [
    {"month": "Jan", "sales": 15000, "expenses": 12000},
    {"month": "Feb", "sales": 18000, "expenses": 13000},
    {"month": "Mar", "sales": 22000, "expenses": 14000},
]


def test_get_sample_data():
    """Test getting sample data"""
    response = client.get("/api/data/sample")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) > 0


def test_analyze_sales():
    """Test sales data analysis"""
    response = client.post("/api/data/analyze", json=sample_data)
    assert response.status_code == 200
    result = response.json()

    assert "total_sales" in result
    assert "total_profit" in result
    assert "best_month" in result
    assert result["total_sales"] == 55000
    assert result["total_profit"] == 16000


def test_chart_data():
    """Test chart data generation"""
    response = client.post("/api/data/chart-data", json=sample_data)
    assert response.status_code == 200
    result = response.json()

    assert "labels" in result
    assert "sales" in result
    assert len(result["labels"]) == 3


def test_statistics():
    """Test statistics calculation"""
    response = client.post("/api/data/statistics", json=sample_data)
    assert response.status_code == 200
    result = response.json()

    assert "sales" in result
    assert "mean" in result["sales"]
    assert "median" in result["sales"]


def test_predict_trend():
    """Test trend prediction"""
    response = client.post("/api/data/predict-trend", json=sample_data)
    assert response.status_code == 200
    result = response.json()

    assert "next_month_sales" in result
    assert "trend" in result
    assert "confidence" in result


def test_empty_data():
    """Test error handling for empty data"""
    response = client.post("/api/data/analyze", json=[])
    assert response.status_code == 400
```

Run tests:

```bash
pytest tests/test_data.py -v
```

---

## ✅ Phase 4 Verification

- [ ] pandas and numpy installed
- [ ] Data router created and imported
- [ ] All endpoints work in /docs
- [ ] Can analyze sample data
- [ ] DataAnalysis component renders
- [ ] All tests pass
- [ ] Can predict sales trends

---

## 📊 Learning Outcomes

After completing Phase 4, you'll understand:

- **pandas basics**: DataFrames, operations, calculations
- **numpy**: Array operations, statistical functions
- **Data analysis**: Mean, median, standard deviation
- **API design**: Structuring data endpoints
- **Error handling**: Validating input data

---

## 🎯 Next Steps

**Ready for Phase 5?** Move on to database integration with SQLAlchemy!

---

## 🐛 Troubleshooting

**Import errors?**

- Install: `pip install pandas numpy`
- Restart Python server

**Slow performance?**

- pandas is optimized for large datasets
- For small data, it might seem overkill
- Consider caching for repeated calculations

**Memory issues?**

- Limit data size in requests
- Add validation for maximum rows
- Use pagination for large datasets
