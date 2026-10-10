import api from "./api";

export const leaveService = {
  async getLeaveBalance() {
    try {
      const response = await api.get("/leave/balance");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch leave balance" };
    }
  },

  async getMyLeaves(params = {}) {
    try {
      const response = await api.get("/leave/my-requests", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch leave requests" };
    }
  },

  async applyLeave(data) {
    try {
      const response = await api.post("/leave/apply", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to apply for leave" };
    }
  }
};