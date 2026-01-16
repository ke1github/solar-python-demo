# Phase 7: Production Ready

**Goal:** Deploy your application to production with best practices.

**Time:** 60-90 minutes  
**Status:** ⏳ UPCOMING

---

## What You'll Build

- Docker containerization
- Environment configuration
- Production database
- Logging and monitoring
- Security hardening
- CI/CD pipeline
- Deployment guides

---

## Prerequisites

- ✅ All previous phases complete
- Docker installed
- Basic understanding of DevOps
- Cloud account (optional: Vercel, Railway, AWS)

---

## Part A: Docker Configuration

### Step 7A.1: Create Python API Dockerfile

**Create `python-api/Dockerfile`:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 7A.2: Create Next.js Dockerfile

**Create `my-app/Dockerfile`:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy application
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Run
CMD ["npm", "start"]
```

### Step 7A.3: Create Docker Compose

**Create `docker-compose.yml` at project root:**

```yaml
version: "3.8"

services:
  backend:
    build: ./python-api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./solar_demo.db
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./python-api:/app
      - backend-data:/app/data
    restart: unless-stopped

  frontend:
    build: ./my-app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  backend-data:
```

### Step 7A.4: Build and Run with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Part B: Environment Configuration

### Step 7B.1: Create Environment Files

**Create `python-api/.env.example`:**

```env
# Database
DATABASE_URL=sqlite:///./solar_demo.db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# API
API_TITLE=Solar Python API
API_VERSION=1.0.0

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Create `my-app/.env.local.example`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 7B.2: Load Environment Variables

**Update `python-api/main.py`:**

```python
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title=os.getenv("API_TITLE", "Solar Python API"),
    version=os.getenv("API_VERSION", "1.0.0"),
)

# CORS from environment
origins = os.getenv("CORS_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Part C: Logging & Monitoring

### Step 7C.1: Setup Logging

**Create `python-api/logger.py`:**

```python
"""Logging configuration"""
import logging
import sys
from datetime import datetime

# Create logs directory
import os
os.makedirs("logs", exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"logs/app_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("solar_api")
```

### Step 7C.2: Add Request Logging Middleware

```python
from fastapi import Request
import time
from logger import logger

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} "
        f"completed in {process_time:.2f}s "
        f"with status {response.status_code}"
    )

    return response
```

### Step 7C.3: Add Health Check Endpoint

```python
@app.get("/health", tags=["health"])
def health_check():
    """Comprehensive health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv("API_VERSION", "1.0.0"),
        "database": "connected",  # Add actual DB check
    }
```

---

## Part D: Security Hardening

### Step 7D.1: Add Security Headers

```bash
pip install python-multipart
```

**Update `main.py`:**

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# Security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "*.yourdomain.com"]
)

# Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Step 7D.2: Input Validation

Already covered with Pydantic models, but add:

```python
from pydantic import validator

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v
```

---

## Part E: Database Migration

### Step 7E.1: Setup Alembic

```bash
cd python-api
alembic init alembic
```

### Step 7E.2: Configure Alembic

**Edit `alembic/env.py`:**

```python
from database import Base
from models import User, Task  # Import all models

target_metadata = Base.metadata
```

### Step 7E.3: Create Migrations

```bash
# Generate migration
alembic revision --autogenerate -m "Initial tables"

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

---

## Part F: Deployment Options

### Option 1: Vercel (Next.js) + Railway (Python)

**Deploy Next.js to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd my-app
vercel
```

**Deploy Python to Railway:**

1. Sign up at railway.app
2. Connect GitHub repository
3. Add Python service
4. Set environment variables
5. Deploy automatically on push

### Option 2: Docker on VPS (DigitalOcean, Linode)

```bash
# SSH to server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/yourusername/solar-python-demo.git
cd solar-python-demo

# Set environment variables
cp python-api/.env.example python-api/.env
# Edit .env with production values

# Deploy
docker-compose up -d

# Setup reverse proxy (Nginx)
sudo apt install nginx
# Configure nginx for SSL and proxy
```

### Option 3: AWS (Elastic Beanstalk + S3)

```bash
# Install AWS CLI and EB CLI
pip install awsebcli

# Initialize
eb init

# Deploy
eb create production-env
eb deploy
```

---

## Part G: CI/CD Pipeline

### Step 7G.1: GitHub Actions

**Create `.github/workflows/ci.yml`:**

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          cd python-api
          pip install -r requirements.txt

      - name: Run tests
        run: |
          cd python-api
          pytest tests/ -v

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: |
          cd my-app
          npm ci

      - name: Build
        run: |
          cd my-app
          npm run build

  deploy:
    needs: [test-python, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        run: |
          echo "Deploy script here"
```

---

## Part H: Monitoring & Analytics

### Step 7H.1: Add Sentry for Error Tracking

```bash
pip install sentry-sdk
```

```python
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
)
```

### Step 7H.2: Add Prometheus Metrics

```bash
pip install prometheus-fastapi-instrumentator
```

```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

---

## ✅ Phase 7 Verification

- [ ] Docker containers build successfully
- [ ] Docker Compose runs both services
- [ ] Environment variables loaded
- [ ] Logging to files working
- [ ] Security headers present
- [ ] Database migrations work
- [ ] CI/CD pipeline runs
- [ ] Application deployed to production

---

## 📝 Production Checklist

### Before Going Live:

- [ ] Change SECRET_KEY to secure random string
- [ ] Use production database (PostgreSQL recommended)
- [ ] Enable HTTPS/SSL
- [ ] Setup backup strategy
- [ ] Configure monitoring and alerts
- [ ] Document API endpoints
- [ ] Set up error tracking
- [ ] Implement rate limiting
- [ ] Add API versioning
- [ ] Setup CDN for static assets
- [ ] Configure caching
- [ ] Test disaster recovery
- [ ] Setup automated backups
- [ ] Document deployment process
- [ ] Create runbooks for common issues

---

## 🎉 Congratulations!

You've completed all 7 phases! You now have:

✅ Production-ready full-stack application  
✅ Python API with FastAPI  
✅ Next.js frontend  
✅ Database integration  
✅ Authentication & authorization  
✅ Real-time features  
✅ Testing & CI/CD  
✅ Docker deployment

---

## 🚀 What's Next?

- Add more features based on user feedback
- Scale horizontally with load balancers
- Implement microservices architecture
- Add GraphQL API
- Mobile app with React Native
- Machine learning integrations
- Advanced analytics

**Keep learning and building! 🌟**
