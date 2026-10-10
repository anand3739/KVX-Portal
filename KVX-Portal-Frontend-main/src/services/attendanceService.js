import api from "./api";

export const attendanceService = {
  // Clock in
  async clockIn(location) {
    try {
      const response = await api.post("/attendance/clock-in", { location });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to clock in" };
    }
  },

  // Clock out
  async clockOut() {
    try {
      const response = await api.post("/attendance/clock-out");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to clock out" };
    }
  },

  // Get today's attendance
  async getTodayAttendance() {
    try {
      const response = await api.get("/attendance/today");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch today's attendance" };
    }
  },

  // Get monthly attendance
  async getMonthlyAttendance(year, month) {
    try {
      const response = await api.get(`/attendance/monthly/${year}/${month}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch monthly attendance" };
    }
  },

  // Get attendance report (HR/Admin)
  async getAttendanceReport(params) {
    try {
      const response = await api.get("/attendance/report", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch attendance report" };
    }
  },
};