import api from "./api";

export const payrollService = {
  // Get my payroll
  async getMyPayroll(params = {}) {
    try {
      const response = await api.get("/payroll/my-payroll", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch payroll" };
    }
  },

  // Get all payroll (HR/Admin)
  async getAllPayroll(params = {}) {
    try {
      const response = await api.get("/payroll/all", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch payroll data" };
    }
  },

  // Process payroll (HR/Admin)
  async processPayroll(data) {
    try {
      const response = await api.post("/payroll/process", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to process payroll" };
    }
  },

  // Download payslip
  async downloadPayslip(payrollId) {
    try {
      const response = await api.get(`/payroll/${payrollId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to download payslip" };
    }
  },
};