import api from "./api";

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  // Create employee (Admin only)
  async createEmployee(employeeData) {
    try {
      const response = await api.post("/auth/create-employee", employeeData);
      return response.data;
    } catch (error) {
      console.error("❌ Create employee error:", error.response?.data || error.message);
      throw error.response?.data || { message: "Failed to create employee" };
    }
  },

  // Logout
  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to change password" };
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to send reset email" };
    }
  },

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post("/auth/reset-password", { 
        token, 
        new_password: newPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reset password" };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user" };
    }
  },

  // Update profile
  async updateProfile(profile) {
    try {
      const response = await api.put("/auth/profile", profile);
      const updatedUser = response.data?.user || response.data;
      if (updatedUser) {
        this.updateStoredUser(updatedUser);
      }
      return response.data;
    } catch (error) {
      if (error.response?.data) throw error.response.data;
      this.updateStoredUser(profile);
      return { user: profile };
    }
  },

  // Get stored user
  getStoredUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Update stored user
  updateStoredUser(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  },
};