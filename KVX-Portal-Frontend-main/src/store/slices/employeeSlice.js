import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
  filters: {
    department: "all",
    status: "all",
    search: ""
  }
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.employees = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addEmployee: (state, action) => {
      state.employees.push(action.payload);
    },
    updateEmployee: (state, action) => {
      const index = state.employees.findIndex(emp => emp.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    deleteEmployee: (state, action) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
    }
  }
});

export const {
  setEmployees,
  setSelectedEmployee,
  setLoading,
  setError,
  setFilters,
  addEmployee,
  updateEmployee,
  deleteEmployee
} = employeeSlice.actions;

export default employeeSlice.reducer;