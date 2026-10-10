import { createSlice } from "@reduxjs/toolkit";

// Get token from localStorage
const token = localStorage.getItem("token");
const userStr = localStorage.getItem("user");

const initialState = {
  user: userStr ? JSON.parse(userStr) : null,
  token: token || null,
  isAuthenticated: !!token, // This is key!
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;