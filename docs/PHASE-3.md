# Phase 3: Testing & Validation

**Goal:** Add automated tests for reliability and confidence.

**Time:** 30-45 minutes  
**Status:** ⏳ UPCOMING

---

## What You'll Build

- pytest test suite for Python
- Test coverage reporting
- API endpoint tests
- Error handling tests

---

## Prerequisites

- ✅ Phase 1 complete
- ✅ Phase 2 complete
- Python virtual environment activated

---

## Step 3.1: Create Test Directory Structure

```bash
cd python-api
mkdir tests
```

Create the following files:

**`tests/__init__.py`** (empty file to make tests a package)

---

## Step 3.2: Create Basic API Tests

**Create `tests/test_main.py`:**

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
    assert data["message"] == "Welcome to Solar Python API!"


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
    assert len(data["features"]) > 0
    assert data["name"] == "Solar Python API"
```

---

## Step 3.3: Create Calculator Tests

**Create `tests/test_calculator.py`:**

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
    data = response.json()
    assert data["result"] == 15
    assert data["x"] == 10
    assert data["y"] == 5
    assert data["operation"] == "add"


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
    data = response.json()
    assert "detail" in data
    assert "zero" in data["detail"].lower()


def test_invalid_operation():
    """Test invalid operation error handling"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": 10, "y": 5, "operation": "power"}
    )
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_list_operations():
    """Test operations list endpoint"""
    response = client.get("/api/calculator/operations")
    assert response.status_code == 200
    data = response.json()
    assert "operations" in data
    assert "add" in data["operations"]
    assert "subtract" in data["operations"]
    assert "multiply" in data["operations"]
    assert "divide" in data["operations"]


def test_decimal_numbers():
    """Test calculator with decimal numbers"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": 10.5, "y": 2.5, "operation": "add"}
    )
    assert response.status_code == 200
    assert response.json()["result"] == 13.0


def test_negative_numbers():
    """Test calculator with negative numbers"""
    response = client.post(
        "/api/calculator/calculate",
        json={"x": -10, "y": 5, "operation": "add"}
    )
    assert response.status_code == 200
    assert response.json()["result"] == -5
```

---

## Step 3.4: Run Tests

Make sure you're in the `python-api` directory with virtual environment activated:

```bash
pytest tests/ -v
```

**Expected Output:**

```
tests/test_main.py::test_root PASSED
tests/test_main.py::test_health_check PASSED
tests/test_main.py::test_api_info PASSED
tests/test_calculator.py::test_addition PASSED
tests/test_calculator.py::test_subtraction PASSED
tests/test_calculator.py::test_multiplication PASSED
tests/test_calculator.py::test_division PASSED
tests/test_calculator.py::test_division_by_zero PASSED
tests/test_calculator.py::test_invalid_operation PASSED
tests/test_calculator.py::test_list_operations PASSED
tests/test_calculator.py::test_decimal_numbers PASSED
tests/test_calculator.py::test_negative_numbers PASSED

============ 12 passed in 0.50s ============
```

---

## Step 3.5: Add Test Coverage

Install coverage tool:

```bash
pip install pytest-cov
pip freeze > requirements.txt
```

Run tests with coverage:

```bash
pytest tests/ --cov=. --cov-report=html
```

View coverage report:

```bash
# Open in browser
start htmlcov/index.html  # Windows
open htmlcov/index.html   # macOS
```

**Goal:** Aim for >80% code coverage

---

## Step 3.6: Create pytest Configuration

**Create `pytest.ini` in python-api directory:**

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    -v
    --strict-markers
    --tb=short
    --cov=.
    --cov-report=term-missing
    --cov-report=html
```

Now you can just run:

```bash
pytest
```

---

## Step 3.7: Add Test Script to Requirements

Update `requirements.txt` to include testing dependencies:

```bash
pip install pytest pytest-cov pytest-asyncio
pip freeze > requirements.txt
```

---

## ✅ Phase 3 Verification

- [ ] All tests pass (12/12)
- [ ] Coverage report generated
- [ ] Coverage > 80%
- [ ] No warnings in test output
- [ ] pytest.ini configured

---

## 📊 Understanding Test Results

**Test Output Explained:**

- `PASSED` = Test successful ✅
- `FAILED` = Test failed, code has bugs ❌
- `ERROR` = Test couldn't run, setup issue ⚠️
- `SKIPPED` = Test intentionally skipped ⏭️

**Coverage Metrics:**

- **90-100%** = Excellent coverage 🌟
- **80-90%** = Good coverage ✅
- **70-80%** = Acceptable ⚠️
- **<70%** = Needs improvement ❌

---

## 🧪 Testing Best Practices

1. **Write tests first** (TDD approach)
2. **Test edge cases** (zero, negative, null)
3. **Test error handling** (what happens when things go wrong)
4. **Keep tests simple** (one assertion per test ideally)
5. **Run tests often** (before commits)

---

## 🎯 Advanced Testing (Optional)

### Parametrized Tests

Test multiple inputs efficiently:

```python
import pytest

@pytest.mark.parametrize("x,y,op,expected", [
    (10, 5, "add", 15),
    (10, 5, "subtract", 5),
    (10, 5, "multiply", 50),
    (10, 5, "divide", 2),
])
def test_calculator_operations(x, y, op, expected):
    response = client.post(
        "/api/calculator/calculate",
        json={"x": x, "y": y, "operation": op}
    )
    assert response.status_code == 200
    assert response.json()["result"] == expected
```

### Fixtures for Setup

Reuse test setup code:

```python
import pytest

@pytest.fixture
def calculator_data():
    return {"x": 10, "y": 5}

def test_with_fixture(calculator_data):
    response = client.post(
        "/api/calculator/calculate",
        json={**calculator_data, "operation": "add"}
    )
    assert response.status_code == 200
```

---

## 🐛 Troubleshooting

**Tests not found?**

- Check `__init__.py` exists in tests folder
- Verify file names start with `test_`
- Run from python-api directory

**Import errors?**

- Activate virtual environment
- Check all dependencies installed
- Verify PYTHONPATH

**Coverage not working?**

- Install pytest-cov: `pip install pytest-cov`
- Check pytest.ini configuration

---

## 🎉 Success!

You now have:

- ✅ Automated test suite
- ✅ Coverage reporting
- ✅ Confidence in your code
- ✅ Professional development workflow

**Next:** Move to Phase 4 for data processing!
