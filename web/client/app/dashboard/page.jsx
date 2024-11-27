"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import useTodoStore from "../../store/todoStore";
import useAuthStore from "../../store/authStore";

export default function Dashboard() {
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "Medium",
    progress: "Todo",
    dueDate: new Date().toISOString(),
    completed: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const router = useRouter();

  const {
    todos,
    isLoading,
    error,
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    markTodoAsCompleted,
  } = useTodoStore();

  const { user, logout } = useAuthStore();

  useEffect(() => {
    getTodos();
  }, [getTodos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTodo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();

    const success = await createTodo(newTodo);
    if (success) {
      setNewTodo({
        title: "",
        description: "",
        priority: "Medium",
        progress: "Todo",
        dueDate: new Date().toISOString(),
        completed: false,
      });
      setIsModalOpen(false);
    }
  };

  const handleEditTodo = async (e) => {
    e.preventDefault();

    await updateTodo(editingTodo._id, editingTodo);
    setEditingTodo(null);
    setIsModalOpen(false);
  };

  const handleCheckboxChange = async (id, currentCompletedStatus) => {
    const updatedTodo = { ...editingTodo, completed: !currentCompletedStatus };
    await updateTodo(id, updatedTodo);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/signin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTodoStyle = (completed) => {
    if (completed) {
      return "line-through text-gray-500";
    }
    return "underline text-black";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Todo Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {user?.fullname || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          {error}
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setEditingTodo(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add New Todo
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg">
          {todos.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No todos found. Create your first todo!
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className="p-4 border-b flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() =>
                      handleCheckboxChange(todo._id, todo.completed)
                    }
                    className="h-5 w-5 text-blue-600"
                  />
                  <div>
                    <h3
                      className={`text-lg font-semibold ${getTodoStyle(
                        todo.completed
                      )}`}
                    >
                      {todo.title}
                    </h3>
                    <p className="text-gray-500 text-sm">{todo.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                      todo.priority
                    )}`}
                  >
                    {todo.priority}
                  </span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(todo.dueDate), "MMM dd, yyyy")}
                  </span>
                  <button
                    onClick={() => {
                      setEditingTodo(todo);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">
                {editingTodo ? "Edit Todo" : "Add New Todo"}
              </h2>
              <form onSubmit={editingTodo ? handleEditTodo : handleCreateTodo}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={editingTodo ? editingTodo.title : newTodo.title}
                    onChange={
                      editingTodo
                        ? (e) =>
                            setEditingTodo((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                        : handleInputChange
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={
                      editingTodo
                        ? editingTodo.description
                        : newTodo.description
                    }
                    onChange={
                      editingTodo
                        ? (e) =>
                            setEditingTodo((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                        : handleInputChange
                    }
                    className="w-full p-2 border rounded"
                  />
                  <select
                    name="priority"
                    value={
                      editingTodo ? editingTodo.priority : newTodo.priority
                    }
                    onChange={
                      editingTodo
                        ? (e) =>
                            setEditingTodo((prev) => ({
                              ...prev,
                              priority: e.target.value,
                            }))
                        : handleInputChange
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={
                      editingTodo
                        ? format(
                            new Date(editingTodo.dueDate),
                            "yyyy-MM-dd'T'HH:mm"
                          )
                        : format(
                            new Date(newTodo.dueDate),
                            "yyyy-MM-dd'T'HH:mm"
                          )
                    }
                    onChange={
                      editingTodo
                        ? (e) =>
                            setEditingTodo((prev) => ({
                              ...prev,
                              dueDate: new Date(e.target.value).toISOString(),
                            }))
                        : (e) =>
                            setNewTodo((prev) => ({
                              ...prev,
                              dueDate: new Date(e.target.value).toISOString(),
                            }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    {editingTodo ? "Save Changes" : "Add Todo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
