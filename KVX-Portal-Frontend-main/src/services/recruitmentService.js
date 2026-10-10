import api from "./api";

export const recruitmentService = {
  // Get all job postings
  async getJobPostings(params = {}) {
    try {
      const response = await api.get("/recruitment/jobs", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch job postings" };
    }
  },

  // Create job posting (HR/Admin)
  async createJobPosting(data) {
    try {
      const response = await api.post("/recruitment/jobs", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create job posting" };
    }
  },

  // Get applications for a job
  async getApplications(jobId, params = {}) {
    try {
      const response = await api.get(`/recruitment/jobs/${jobId}/applications`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch applications" };
    }
  },

  // Update application status
  async updateApplicationStatus(applicationId, status, feedback) {
    try {
      const response = await api.put(`/recruitment/applications/${applicationId}`, { status, feedback });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update application" };
    }
  },
};