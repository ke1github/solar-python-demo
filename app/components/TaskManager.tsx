"use client";
import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: number;
}

export default function TaskManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchTasks(selectedUser);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const fetchTasks = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/tasks?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      setError("Failed to fetch tasks");
    }
  };

  const createUser = async () => {
    if (!newUserName || !newUserEmail) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUserName, email: newUserEmail }),
      });

      if (response.ok) {
        setNewUserName("");
        setNewUserEmail("");
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to create user");
      }
    } catch (err) {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle || !selectedUser) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          user_id: selectedUser,
        }),
      });

      if (response.ok) {
        setNewTaskTitle("");
        fetchTasks(selectedUser);
      }
    } catch (err) {
      setError("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: number) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: "PATCH",
      });

      if (response.ok && selectedUser) {
        fetchTasks(selectedUser);
      }
    } catch (err) {
      setError("Failed to toggle task");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok && selectedUser) {
        fetchTasks(selectedUser);
      }
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Task Manager (SQLAlchemy)
      </h3>

      <div className="space-y-6">
        {/* Create User Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Create User
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Name"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createUser}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* User Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Select User
          </h4>
          <select
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Create Task Section */}
        {selectedUser && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Create Task
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={createTask}
                disabled={loading}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {selectedUser && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tasks ({tasks.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4 text-center">
                  No tasks yet. Create one above!
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        task.completed
                          ? "line-through text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
