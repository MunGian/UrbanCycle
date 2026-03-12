import { User } from "@/lib/api/apiModel";
import { create } from "zustand";

interface UserState {
  user: User | null | undefined;
  loading: boolean;
  hasOpenedPicker?: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setHasOpenedPicker: (opened: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: undefined,
  loading: true,
  hasOpenedPicker: false,
  setUser: (user) => set({ user, loading: false }),
  clearUser: () => set({ user: null, loading: false }),
  setHasOpenedPicker: (opened) => set({ hasOpenedPicker: opened }),
}));
