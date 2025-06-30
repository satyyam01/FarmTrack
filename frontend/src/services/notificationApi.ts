import api from "./api";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user_id: string;
  farm_id: string;
}

export const notificationApi = {
  // Get all notifications for the user
  getAll: async (): Promise<Notification[]> => {
    try {
      const response = await api.get<Notification[]>('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get night return alerts only
  getNightReturnAlerts: async (): Promise<Notification[]> => {
    try {
      const response = await api.get<Notification[]>('/notifications');
      return response.data.filter(n => n.title === "Night Return Alert");
    } catch (error) {
      console.error('Error fetching night return alerts:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Run manual night check (admin only)
  runNightCheck: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/notifications/test-night-check');
      return response.data;
    } catch (error) {
      console.error('Error running night check:', error);
      throw error;
    }
  },

  // Run barn check alert
  runBarnCheck: async (): Promise<{ message: string; alerts: Notification[] }> => {
    try {
      const response = await api.get<{ message: string; alerts: Notification[] }>('/alerts/barn-check');
      return response.data;
    } catch (error) {
      console.error('Error running barn check:', error);
      throw error;
    }
  }
}; 