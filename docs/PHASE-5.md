# Phase 5: Database Integration with SQLAlchemy

**Goal:** Add persistent data storage with SQLite and SQLAlchemy ORM.

**Time:** 60-90 minutes  
**Status:** ⏳ UPCOMING

---

## What You'll Build

- SQLite database with SQLAlchemy
- Database models (User, Task)
- CRUD operations (Create, Read, Update, Delete)
- Database migrations
- Relationship management

---

## Prerequisites

- ✅ Phase 1-4 complete
- Understanding of database concepts
- Python virtual environment activated

---

## Step 5.1: Install Database Dependencies

```bash
cd python-api
pip install sqlalchemy databases aiosqlite alembic
pip freeze > requirements.txt
```

**What each package does:**

- `sqlalchemy` - ORM for database operations
- `databases` - Async database support
- `aiosqlite` - SQLite async driver
- `alembic` - Database migration tool

---

## Step 5.2: Create Database Configuration

**Create `python-api/database.py`:**

```python
"""Database configuration and models"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Database URL - SQLite for simplicity
DATABASE_URL = "sqlite:///./solar_demo.db"

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True  # Log SQL queries (disable in production)
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


# Models
class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to tasks
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, email={self.email})>"


class Task(Base):
    """Task model"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String)
    completed = Column(Boolean, default=False)
    priority = Column(Integer, default=0)  # 0=low, 1=medium, 2=high
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to user
    owner = relationship("User", back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, completed={self.completed})>"


# Initialize database
def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized!")


# Dependency for getting DB session
def get_db():
    """Provide database session for each request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Step 5.3: Create User CRUD Operations

**Create `python-api/routers/users.py`:**

```python
"""User CRUD operations"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime
from database import get_db, User

router = APIRouter(prefix="/api/users", tags=["users"])


# Pydantic schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    # Check if email already exists
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all users with pagination"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """Update user information"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.name is not None:
        user.name = user_update.name
    if user_update.email is not None:
        # Check email uniqueness
        existing = db.query(User).filter(
            User.email == user_update.email,
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = user_update.email

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully"}
```

---

## Step 5.4: Create Task CRUD Operations

**Create `python-api/routers/tasks.py`:**

```python
"""Task CRUD operations"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from database import get_db, Task, User

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


# Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 0
    user_id: int


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    # Verify user exists
    user = db.query(User).filter(User.id == task.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        user_id=task.user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    completed: Optional[bool] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List tasks with optional filters"""
    query = db.query(Task)

    if completed is not None:
        query = query.filter(Task.completed == completed)
    if user_id is not None:
        query = query.filter(Task.user_id == user_id)

    tasks = query.offset(skip).limit(limit).all()
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.completed is not None:
        task.completed = task_update.completed
    if task_update.priority is not None:
        task.priority = task_update.priority

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": f"Task {task_id} deleted successfully"}


@router.post("/{task_id}/toggle")
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    """Toggle task completion status"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task
```

---

## Step 5.5: Update main.py

```python
from database import init_db
from routers import calculator, data, users, tasks

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Include all routers
app.include_router(calculator.router)
app.include_router(data.router)
app.include_router(users.router)
app.include_router(tasks.router)
```

Restart your server - database will be created automatically!

---

## Step 5.6: Test Database Operations

Visit http://localhost:8000/docs

**Test flow:**

1. Create a user: `POST /api/users/`
2. Create a task for that user: `POST /api/tasks/`
3. List tasks: `GET /api/tasks/`
4. Toggle task: `POST /api/tasks/{id}/toggle`
5. Update task: `PUT /api/tasks/{id}`
6. Delete task: `DELETE /api/tasks/{id}`

---

## Step 5.7: Create Task Manager UI

**Create `my-app/app/components/TaskManager.tsx`:**

```typescript
"use client";
import { useState, useEffect } from "react";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: number;
  user_id: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTask, setNewTask] = useState({ title: "", user_id: 1 });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    const response = await fetch("http://localhost:8000/api/tasks/");
    const data = await response.json();
    setTasks(data);
  };

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:8000/api/users/");
    const data = await response.json();
    setUsers(data);
  };

  const createTask = async () => {
    if (!newTask.title) return;

    await fetch("http://localhost:8000/api/tasks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    setNewTask({ title: "", user_id: 1 });
    fetchTasks();
  };

  const toggleTask = async (id: number) => {
    await fetch(`http://localhost:8000/api/tasks/${id}/toggle`, {
      method: "POST",
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`http://localhost:8000/api/tasks/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-xl font-bold mb-4">Task Manager</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="New task..."
          className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
        />
        <button
          onClick={createTask}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Add Task
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-4 h-4"
            />
            <span className={task.completed ? "line-through flex-1" : "flex-1"}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Phase 5 Verification

- [ ] SQLAlchemy installed
- [ ] Database file created (`solar_demo.db`)
- [ ] Can create users
- [ ] Can create tasks linked to users
- [ ] Can toggle task completion
- [ ] Can delete tasks and users
- [ ] Foreign key relationships work
- [ ] Task Manager UI functions

---

## 📚 Learning Outcomes

- **ORM basics**: Models, relationships, queries
- **CRUD operations**: Create, Read, Update, Delete
- **Foreign keys**: Linking related data
- **Database sessions**: Managing connections
- **Cascading deletes**: Automatic cleanup

---

## 🎯 Advanced Topics (Optional)

### Database Migrations with Alembic

```bash
alembic init migrations
# Edit alembic.ini and migrations/env.py
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Database Seeding

Create sample data for development:

```python
def seed_database():
    db = SessionLocal()

    # Create sample users
    user1 = User(name="John Doe", email="john@example.com")
    db.add(user1)
    db.commit()

    # Create sample tasks
    task1 = Task(title="Learn Python", user_id=user1.id)
    db.add(task1)
    db.commit()

    db.close()
```

---

## 🐛 Troubleshooting

**Database locked errors?**

- Close all connections
- Delete `solar_demo.db` and restart

**Foreign key errors?**

- Ensure user exists before creating task
- Check user_id is valid

**Migration issues?**

- Start fresh: delete database and migrations
- Reinitialize alembic

**Next:** Phase 6 for advanced features!
