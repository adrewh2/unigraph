import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";
import { addNotification } from "./notificationStore";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    picture?: string;
    name?: string;
  };
}

interface UserStore {
  // Auth state
  isSignedIn: boolean;
  user: User | null;
  isLoading: boolean;

  // Actions
  setSignedIn: (signedIn: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  // Auth methods
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;

  // User details
  getUserDetails: () => User | null;
  getAvatarUrl: () => string | null;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  isSignedIn: false,
  user: null,
  isLoading: true,

  // Basic setters
  setSignedIn: (signedIn: boolean) => set({ isSignedIn: signedIn }),
  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Initialize auth state
  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          isSignedIn: true,
          user: session.user,
          isLoading: false,
        });
        console.log("UserStore: User authenticated on init:", session.user.id);
      } else {
        set({
          isSignedIn: false,
          user: null,
          isLoading: false,
        });
        console.log("UserStore: No user authenticated on init");
      }

      // Listen for auth changes
      const {
        data: { subscription: _subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("UserStore: Auth state change:", event, session?.user?.id);

        if (event === "SIGNED_IN" && session?.user) {
          set({
            isSignedIn: true,
            user: session.user,
            isLoading: false,
          });
          console.log("UserStore: User signed in:", session.user.id);

          // Show login notification
          const userName =
            session.user.user_metadata?.name || session.user.email || "User";
          addNotification({
            message: `Logged in as: ${userName}`,
            type: "success",
            duration: 3000,
          });
        } else if (event === "SIGNED_OUT") {
          set({
            isSignedIn: false,
            user: null,
            isLoading: false,
          });
          console.log("UserStore: User signed out");

          // Show logout notification
          addNotification({
            message: "User logged out",
            type: "info",
            duration: 3000,
          });
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          set({
            user: session.user,
          });
          console.log("UserStore: Token refreshed for user:", session.user.id);
        }
      });

      // Store subscription for cleanup (we'll handle this in a separate method if needed)
      // For now, the subscription will be active for the lifetime of the store
    } catch (error) {
      console.error("UserStore: Error initializing auth:", error);
      set({ isLoading: false });
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        isSignedIn: false,
        user: null,
      });
      console.log("UserStore: User signed out successfully");
    } catch (error) {
      console.error("UserStore: Error signing out:", error);
      throw error;
    }
  },

  // Get user details
  getUserDetails: () => {
    return get().user;
  },

  // Get avatar URL with fallbacks
  getAvatarUrl: () => {
    const user = get().user;
    if (!user) return null;

    return (
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    );
  },
}));
