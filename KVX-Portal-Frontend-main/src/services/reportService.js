import api from "./api";

export const reportService = {
  // Get attendance report
  async getAttendanceReport(params) {
    try {
      const response = await api.get("/reports/attendance", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch attendance report" };
    }
  },

  // Get payroll report
  async getPayrollReport(params) {
    try {
      const response = await api.get("/reports/payroll", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch payroll report" };
    }
  },

  // Get department report
  async getDepartmentReport() {
    try {
      const response = await api.get("/reports/departments");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch department report" };
    }
  },

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await api.get("/reports/dashboard-stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch dashboard stats" };
    }
  },
};