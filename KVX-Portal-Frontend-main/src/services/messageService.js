import api from "./api";

export const messageService = {
  // Send message
  async sendMessage(recipientId, subject, content, parentMessageId = null) {
    try {
      const response = await api.post("/messages", {
        recipient_id: recipientId,
        subject,
        content,
        parent_message_id: parentMessageId
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to send message" };
    }
  },

  // Get inbox
  async getInbox(params = {}) {
    try {
      const response = await api.get("/messages/inbox", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch inbox" };
    }
  },

  // Get chat contacts
  async getContacts(params = {}) {
    try {
      const response = await api.get("/messages/contacts", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch chat contacts" };
    }
  },

  // Get conversation with a specific contact
  async getConversation(contactId) {
    try {
      const response = await api.get(`/messages/conversation/${contactId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch conversation" };
    }
  },

  // Get message by ID
  async getMessage(id) {
    try {
      const response = await api.get(`/messages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch message" };
    }
  },

  // Toggle star
  async toggleStar(id) {
    try {
      const response = await api.put(`/messages/${id}/star`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update message" };
    }
  },

  // Archive message
  async archiveMessage(id) {
    try {
      const response = await api.put(`/messages/${id}/archive`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to archive message" };
    }
  },

  // Delete message
  async deleteMessage(id) {
    try {
      const response = await api.delete(`/messages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete message" };
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get("/messages/unread");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch unread count" };
    }
  },
};