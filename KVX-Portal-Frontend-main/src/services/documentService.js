import api, { apiWithFormData } from "./api";

export const documentService = {
  // ... existing methods ...

  async uploadProfilePhoto(file, category = "profile") {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await apiWithFormData.post("/documents/upload-profile-photo", formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to upload profile photo" };
    }
  },
};