import api from "./api";

export const employeeService = {
  async getAllEmployees(params = {}) {
    try {
      const response = await api.get("/employees", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch employees" };
    }
  },

  async getEmployeeById(id) {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch employee" };
    }
  },

  async updateEmployee(id, data) {
    try {
      const response = await api.put(`/employees/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update employee" };
    }
  },

  async getEmployeeStats() {
    try {
      const response = await api.get("/employees/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch employee stats" };
    }
  },

  async getEmployeesByDepartment(departmentId) {
    try {
      const response = await api.get(`/employees/department/${departmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch department employees" };
    }
  },

  async deleteEmployee(id) {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete employee" };
    }
  }
};