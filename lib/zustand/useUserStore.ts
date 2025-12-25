import { User } from "@/lib/api/apiModel";
import { create } from "zustand";

interface UserState {
  user: User | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),
  clearUser: () => set({ user: null, loading: false }),
}));
