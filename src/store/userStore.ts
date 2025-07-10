import { create } from "zustand";

interface UserStoreState {
  isSignedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  isSignedIn: false,
  setSignedIn: (signedIn) => set({ isSignedIn: signedIn }),
}));
