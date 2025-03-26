import { create } from "zustand";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    // Auto remove after duration (default 5000ms)
    setTimeout(() => {
      useNotificationStore.getState().removeNotification(id);
    }, notification.duration || 5000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

export const addNotification = (notification: Omit<Notification, "id">) => {
  useNotificationStore.getState().addNotification(notification);
};

export default useNotificationStore;
