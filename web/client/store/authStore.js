import config from "@/app/config/config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import useTodoStore from "./todoStore";
const useAuthStore = create(
  persist(
    immer((set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hydrated: false,
      error: null,

      setHydrated() {
        set({ hydrated: true });
      },

      login: async (email, password) => {
        set({ error: null });
        try {
          const response = await fetch(`${config.backendUrl}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();

            const { user, accessToken, refreshToken } = data.data;
            set((state) => {
              (state.user = user),
                (state.accessToken = accessToken),
                (state.refreshToken = refreshToken);
            });
            return true;
          } else {
            const errorData = await response.json();
            set({ error: errorData?.message || "Login failed" });
            return false;
          }
        } catch (error) {
          set({ error: "Network error occured" });
          return false;
        }
      },

      async register(username, email, password, fullname) {
        set({ error: null });

        try {
          const response = await fetch(`${config.backendUrl}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname, email, username, password }),
          });

          if (response.ok) {
            const data = await response.json();

            const user = data.message;

            set({ user, accessToken: null, refreshToken: null });

            return true;
          } else {
            const errorData = await response.json();
            set({ error: errorData?.message || "Registration Failed" });
            return false;
          }
        } catch (error) {
          set({ error: "Network error occured" });

          return false;
        }
      },

      logout: async () => {
        try {
          const response = await fetch(`${config.backendUrl}/users/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (response.ok) {
            set({ user: null, accessToken: null, refreshToken: null });
            localStorage.clear();
            useTodoStore.getState().clearTodos();
            return true;
          } else {
            const errorData = await response.json();
            set({ error: errorData?.message || "Logout Failed" });
            return false;
          }
        } catch (error) {
          set({ error: "Network error occured" });

          return false;
        }
      },
      clearError: () => set({ error: null }),
      isAuthenticated: () => !!get().accessToken,
    })),

    {
      name: "auth",
      onRehydrateStorage() {
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      },
    }
  )
);

export default useAuthStore;
