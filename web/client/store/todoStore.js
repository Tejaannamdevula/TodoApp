import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware/persist";
import useAuthStore from "./authStore";
import config from "@/app/config/config";

const useTodoStore = create(
  persist(
    immer((set, get) => ({
      todos: [],
      overDue: [],
      today: [],
      upcoming: [],
      error: null,
      hydrated: false,
      isLoading: false,

      setHydrated() {
        set({ hydrated: true });
      },

      getTodos: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await fetch(`${config.backendUrl}/todos/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            set({ todos: data.data });
          } else {
            const errorData = await response.json();
            set({ error: errorData.message || "Failed to fetch todos" });
          }
        } catch (error) {
          set({ error: "Network error occurred" });
        } finally {
          set({ isLoading: false });
        }
      },

      createTodo: async (todoData) => {
        set({ error: null, isLoading: true });
        const accessToken = useAuthStore.getState().accessToken;
        try {
          const response = await fetch(`${config.backendUrl}/todos/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: JSON.stringify(todoData),
          });

          if (response.ok) {
            const data = await response.json();
            set((state) => {
              state.todos.push(data.data);
            });
            return true;
          } else {
            const errorData = await response.json();
            set({ error: errorData.message || "Failed to create todo" });
            return false;
          }
        } catch (error) {
          set({ error: "Network error occurred" });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      getFilteredTodos: async () => {
        const accessToken = useAuthStore.getState().accessToken;
        set({ error: null, isLoading: true });
        try {
          const response = await fetch(`${config.backendUrl}/todos/filtered`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            const { overDue, today, upcoming } = data.data;
            set({ overDue, today, upcoming });
          } else {
            const errorData = await response.json();
            set({
              error: errorData.message || "Failed to fetch filtered todos",
            });
          }
        } catch (error) {
          set({ error: "Network error occurred" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateTodo: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
          const accessToken = useAuthStore.getState().accessToken;

          const response = await fetch(`${config.backendUrl}/todos/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updatedData),
            credentials: "include",
          });

          if (response.ok) {
            const { data } = await response.json();

            set((state) => {
              const index = state.todos.findIndex((todo) => todo._id === id);
              if (index !== -1) {
                state.todos[index] = data;
              }
            });
          } else {
            const { message } = await response.json();
            set({ error: message || "Failed to update todo" });
          }
        } catch (error) {
          set({ error: "Network error occurred" });
        } finally {
          set({ isLoading: false });
        }
      },
      deleteTodo: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await fetch(`${config.backendUrl}/todos/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const { data } = await response.json();
            set((state) => {
              state.todos = state.todos.filter((todo) => todo._id !== data._id);
            });
          } else {
            const { message } = await response.json();
            set({ error: message || "Failed to delete todo" });
          }
        } catch (error) {
          set({ error: "Network error occurred" });
        } finally {
          set({ isLoading: false });
        }
      },

      markTodoAsCompleted: async (id) => {
        set({ isLoading: true });
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await fetch(
            `${config.backendUrl}/todos/${id}/complete`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to mark todo as completed");
          }

          const data = await response.json();
          set((state) => ({
            todos: state.todos.map((todo) =>
              todo._id === data.data._id ? data.data : todo
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          console.error("Error marking todo as completed:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      clearTodos: () => {
        set({ todos: [], overDue: [], today: [], upcoming: [], error: null });
      },
    })),
    {
      name: "todo",
      onRehydrateStorage() {
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      },
    }
  )
);

export default useTodoStore;
