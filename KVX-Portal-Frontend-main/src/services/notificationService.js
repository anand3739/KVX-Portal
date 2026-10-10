import api from "./api";

export const notificationService = {
  async getNotifications(limit = 50) {
    try {
      const response = await api.get("/notifications", { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch notifications" };
    }
  },

  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to mark as read" };
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.put("/notifications/mark-all-read");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to mark all as read" };
    }
  },

  async getUnreadCount() {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to get unread count" };
    }
  }
};