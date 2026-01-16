# Phase 6: Advanced Features

**Goal:** Add authentication, WebSockets, background tasks, and file uploads.

**Time:** 90-120 minutes  
**Status:** ⏳ UPCOMING

---

## What You'll Build

- JWT authentication & authorization
- WebSocket real-time notifications
- Background task processing
- File upload handling
- Rate limiting
- Caching with Redis (optional)

---

## Prerequisites

- ✅ Phase 1-5 complete
- Understanding of authentication concepts
- Redis installed (optional, for caching)

---

## Part A: JWT Authentication

### Step 6A.1: Install Auth Dependencies

```bash
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
pip freeze > requirements.txt
```

### Step 6A.2: Create Auth Utilities

**Create `python-api/auth.py`:**

```python
"""Authentication utilities"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db, User

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"  # Change this!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user
```

### Step 6A.3: Update User Model

Add password field to `database.py`:

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)  # Add this
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
```

### Step 6A.4: Create Auth Router

**Create `python-api/routers/auth.py`:**

```python
"""Authentication endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db, User
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["authentication"])


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserProfile(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


@router.post("/register", response_model=UserProfile, status_code=201)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user
```

### Step 6A.5: Protect Endpoints

Update task endpoints to require authentication:

```python
from auth import get_current_user

@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),  # Add this
    db: Session = Depends(get_db)
):
    """Create a new task (authenticated)"""
    # User can only create tasks for themselves
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # ... rest of code
```

---

## Part B: WebSocket Real-Time Updates

### Step 6B.1: Create WebSocket Manager

**Create `python-api/websocket_manager.py`:**

```python
"""WebSocket connection manager"""
from typing import List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()
```

### Step 6B.2: Create WebSocket Endpoint

**Create `python-api/routers/websocket.py`:**

```python
"""WebSocket endpoints for real-time updates"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket_manager import manager
import json

router = APIRouter()


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)

    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connection",
            "message": f"Connected as {client_id}"
        })

        while True:
            # Receive messages from client
            data = await websocket.receive_text()

            # Broadcast to all connected clients
            await manager.broadcast(
                json.dumps({
                    "type": "message",
                    "client_id": client_id,
                    "message": data
                })
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(
            json.dumps({
                "type": "disconnect",
                "message": f"{client_id} left"
            })
        )
```

### Step 6B.3: Create WebSocket Client Component

**Create `my-app/app/components/RealtimeChat.tsx`:**

```typescript
"use client";
import { useEffect, useState, useRef } from "react";

export default function RealtimeChat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const clientId = `user_${Math.random().toString(36).substr(2, 9)}`;
    ws.current = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

    ws.current.onopen = () => {
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, `${data.client_id}: ${data.message}`]);
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (input && ws.current) {
      ws.current.send(input);
      setInput("");
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Real-Time Chat</h3>
        <div
          className={`w-2 h-2 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>

      <div className="h-48 overflow-y-auto border rounded-lg p-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-lg border"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## Part C: Background Tasks

### Step 6C.1: Create Background Task Example

**Add to `python-api/routers/tasks.py`:**

```python
from fastapi import BackgroundTasks
import time


def send_email_notification(email: str, task_title: str):
    """Simulate sending email (background task)"""
    print(f"Sending email to {email} about task: {task_title}")
    time.sleep(2)  # Simulate email sending
    print(f"Email sent to {email}")


@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create task and send notification"""
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Add background task
    background_tasks.add_task(
        send_email_notification,
        current_user.email,
        task.title
    )

    return db_task
```

---

## Part D: File Uploads

### Step 6D.1: Create File Upload Endpoint

**Create `python-api/routers/files.py`:**

```python
"""File upload endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

router = APIRouter(prefix="/api/files", tags=["files"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file"""
    # Validate file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")

    # Save file
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        f.write(contents)

    return {
        "filename": file.filename,
        "size": len(contents),
        "content_type": file.content_type
    }


@router.get("/list")
def list_files():
    """List uploaded files"""
    files = []
    for file_path in UPLOAD_DIR.iterdir():
        if file_path.is_file():
            files.append({
                "filename": file_path.name,
                "size": file_path.stat().st_size
            })
    return {"files": files}
```

---

## Part E: Rate Limiting

### Step 6E.1: Install Slowapi

```bash
pip install slowapi
pip freeze > requirements.txt
```

### Step 6E.2: Add Rate Limiting

**Update `main.py`:**

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.get("/limited")
@limiter.limit("5/minute")
def limited_endpoint(request: Request):
    return {"message": "This endpoint is rate limited"}
```

---

## ✅ Phase 6 Verification

- [ ] JWT authentication working
- [ ] Can register and login users
- [ ] Protected endpoints require token
- [ ] WebSocket connection established
- [ ] Real-time messages working
- [ ] Background tasks execute
- [ ] File uploads work
- [ ] Rate limiting active

---

## 🎓 Learning Outcomes

- **Authentication**: JWT tokens, password hashing
- **Authorization**: Protecting endpoints
- **WebSockets**: Real-time bi-directional communication
- **Background tasks**: Async processing
- **File handling**: Uploads and validation
- **Rate limiting**: API protection

---

## 🎯 Next Steps

Ready for Phase 7 - Production deployment!

---

## 🐛 Troubleshooting

**JWT errors?**

- Change SECRET_KEY to a secure random string
- Check token expiration time

**WebSocket not connecting?**

- Ensure port 8000 is accessible
- Check browser console for errors
- Verify WebSocket URL format

**File uploads failing?**

- Check upload directory permissions
- Verify file size limits
- Check Content-Type headers
