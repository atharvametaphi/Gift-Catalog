import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: true,
      setHydrated: (hydrated) => set({ hydrated }),
      loginSuccess: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "gift-catalog-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state, error) => {
        state?.setHydrated(true);

        if (error) {
          state?.logout();
        }
      },
    },
  ),
);
