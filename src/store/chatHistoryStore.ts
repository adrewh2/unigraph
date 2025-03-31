import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatHistoryState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearHistory: () => void;
}

// Create a persisted store for chat history
const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set) => ({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! How can I help you today?",
          timestamp: new Date(),
        },
      ],
      addMessage: (message: ChatMessage) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      setMessages: (messages: ChatMessage[]) => set({ messages }),
      clearHistory: () =>
        set({
          messages: [
            {
              id: "welcome",
              role: "assistant",
              content: "Hello! How can I help you today?",
              timestamp: new Date(),
            },
          ],
        }),
    }),
    {
      name: "chat-history-storage", // unique name for localStorage
      partialize: (state) => ({
        // Store only the messages
        messages: state.messages.map((msg) => ({
          ...msg,
          // Convert Date objects to ISO strings for storage
          timestamp:
            msg.timestamp instanceof Date
              ? msg.timestamp.toISOString()
              : msg.timestamp,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        // Convert ISO date strings back to Date objects after rehydration
        if (state?.messages) {
          state.messages = state.messages.map((msg) => ({
            ...msg,
            timestamp:
              typeof msg.timestamp === "string"
                ? new Date(msg.timestamp)
                : msg.timestamp,
          }));
        }
      },
    }
  )
);

export default useChatHistoryStore;
