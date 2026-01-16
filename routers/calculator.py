"""Calculator endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/calculator", tags=["calculator"])


class CalculationRequest(BaseModel):
    a: float
    b: float


class CalculationResponse(BaseModel):
    result: float
    operation: str


@router.post("/add", response_model=CalculationResponse)
def add(calc: CalculationRequest):
    """Add two numbers"""
    return {
        "result": calc.a + calc.b,
        "operation": "addition"
    }


@router.post("/subtract", response_model=CalculationResponse)
def subtract(calc: CalculationRequest):
    """Subtract two numbers"""
    return {
        "result": calc.a - calc.b,
        "operation": "subtraction"
    }


@router.post("/multiply", response_model=CalculationResponse)
def multiply(calc: CalculationRequest):
    """Multiply two numbers"""
    return {
        "result": calc.a * calc.b,
        "operation": "multiplication"
    }


@router.post("/divide", response_model=CalculationResponse)
def divide(calc: CalculationRequest):
    """Divide two numbers"""
    if calc.b == 0:
        raise HTTPException(status_code=400, detail="Cannot divide by zero")
    
    return {
        "result": calc.a / calc.b,
        "operation": "division"
    }
