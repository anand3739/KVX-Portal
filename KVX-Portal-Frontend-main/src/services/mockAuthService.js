// src/services/mockAuthService.js
// Temporary mock service - no backend needed

export const DEMO_USERS = {
  "admin@kravix.com": {
    password: "Admin@123",
    user: {
      id: 1,
      email: "admin@kravix.com",
      role: "admin",
      first_name: "Admin",
      last_name: "User",
      name: "Admin User",
      position: "System Administrator",
      department_name: "IT",
      employee_id: "EMP001",
      phone: "+91 98765 43210",
      address: "Hyderabad, Telangana",
      profile_picture_url: null,
      joining_date: "2022-01-15",
      employment_type: "Full-time",
      status: "active"
    }
  },
  "hr@kravix.com": {
    password: "HR@123",
    user: {
      id: 2,
      email: "hr@kravix.com",
      role: "hr",
      first_name: "HR",
      last_name: "Manager",
      name: "HR Manager",
      position: "HR Manager",
      department_name: "Human Resources",
      employee_id: "EMP002",
      phone: "+91 98765 43211",
      address: "Hyderabad, Telangana",
      profile_picture_url: null,
      joining_date: "2021-06-01",
      employment_type: "Full-time",
      status: "active"
    }
  },
  "employee@kravix.com": {
    password: "Emp@123",
    user: {
      id: 3,
      email: "employee@kravix.com",
      role: "employee",
      first_name: "John",
      last_name: "Doe",
      name: "John Doe",
      position: "Software Engineer",
      department_name: "Engineering",
      employee_id: "EMP003",
      phone: "+91 98765 43212",
      address: "Hyderabad, Telangana",
      profile_picture_url: null,
      joining_date: "2023-03-10",
      employment_type: "Full-time",
      status: "active",
      skills: ["React", "JavaScript", "Node.js", "Python"],
      emergency_contact: {
        name: "Jane Doe",
        relationship: "Spouse",
        phone: "+91 98765 00000"
      }
    }
  },
  "ceo@kravix.com": {
    password: "CEO@123",
    user: {
      id: 4,
      email: "ceo@kravix.com",
      role: "ceo",
      first_name: "CEO",
      last_name: "Kravix",
      name: "CEO Kravix",
      position: "Chief Executive Officer",
      department_name: "Executive",
      employee_id: "EMP004",
      phone: "+91 98765 43213",
      address: "Hyderabad, Telangana",
      profile_picture_url: null,
      joining_date: "2020-01-01",
      employment_type: "Full-time",
      status: "active"
    }
  }
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const mockLogin = (email, password) => {
  const record = DEMO_USERS[email];
  if (!record) throw new Error("Invalid email or password");
  if (record.password !== password) throw new Error("Invalid email or password");

  const token = `mock-token-${record.user.role}-${Date.now()}`;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(record.user));
  return { token, user: record.user };
};

export const mockLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const mockGetCurrentUser = () => {
  const user = localStorage.getItem("user");
  if (!user) throw new Error("Not authenticated");
  return { user: JSON.parse(user) };
};

export const mockGetStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const mockUpdateProfile = (updates) => {
  const user = mockGetStoredUser();
  if (!user) throw new Error("Not authenticated");
  const updated = { ...user, ...updates };
  localStorage.setItem("user", JSON.stringify(updated));
  return { user: updated };
};

export const mockChangePassword = (currentPassword, newPassword) => {
  const user = mockGetStoredUser();
  if (!user) throw new Error("Not authenticated");
  const record = DEMO_USERS[user.email];
  if (!record || record.password !== currentPassword)
    throw new Error("Current password is incorrect");
  // In mock mode we just pretend it worked
  return { message: "Password changed successfully" };
};

export const mockForgotPassword = (email) => {
  if (!DEMO_USERS[email]) throw new Error("No account found with this email");
  return { message: "Reset instructions sent" };
};

export const mockResetPassword = (token, newPassword) => {
  // Always succeed in mock mode
  return { message: "Password reset successfully" };
};

// ── Attendance ────────────────────────────────────────────────────────────────

const ATTENDANCE_KEY = "mock_attendance";

const getAttendanceStore = () => {
  try {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveAttendanceStore = (data) => {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
};

export const mockGetTodayAttendance = () => {
  const today = new Date().toISOString().split("T")[0];
  const store = getAttendanceStore();
  return { attendance: store[today] || null };
};

export const mockClockIn = () => {
  const today = new Date().toISOString().split("T")[0];
  const store = getAttendanceStore();
  if (store[today]?.login_time) throw new Error("Already clocked in today");
  store[today] = {
    date: today,
    login_time: new Date().toISOString(),
    logout_time: null,
    total_hours: 0,
    status: "present"
  };
  saveAttendanceStore(store);
  return { attendance: store[today] };
};

export const mockClockOut = () => {
  const today = new Date().toISOString().split("T")[0];
  const store = getAttendanceStore();
  if (!store[today]?.login_time) throw new Error("You haven't clocked in yet");
  if (store[today].logout_time) throw new Error("Already clocked out today");
  const loginTime = new Date(store[today].login_time);
  const now = new Date();
  const diffHours = ((now - loginTime) / 3600000).toFixed(1);
  store[today].logout_time = now.toISOString();
  store[today].total_hours = parseFloat(diffHours);
  saveAttendanceStore(store);
  return { attendance: store[today] };
};

export const mockGetMonthlyAttendance = (year, month) => {
  const store = getAttendanceStore();
  const attendance = [];
  let present = 0, absent = 0, late = 0, totalHours = 0;
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const day = new Date(year, month - 1, d).getDay();
    const isWeekend = day === 0 || day === 6;
    const isFuture = new Date(dateStr) > new Date();

    if (isWeekend) {
      attendance.push({ date: dateStr, status: "weekend" });
    } else if (isFuture) {
      attendance.push({ date: dateStr, status: "future" });
    } else if (store[dateStr]) {
      const rec = store[dateStr];
      attendance.push(rec);
      if (rec.status === "present") present++;
      else if (rec.status === "late") late++;
      totalHours += rec.total_hours || 0;
    } else {
      attendance.push({ date: dateStr, status: "absent" });
      absent++;
    }
  }

  return {
    attendance,
    summary: {
      present,
      absent,
      late,
      halfDay: 0,
      workFromHome: 0,
      totalWorkingDays: present + absent + late,
      totalHours: parseFloat(totalHours.toFixed(1)),
      averageHours: present > 0 ? parseFloat((totalHours / present).toFixed(1)) : 0,
      overtime: 0,
      leaveBalance: 12
    },
    leaveBalance: {
      annual: { total: 20, used: 2, remaining: 18 },
      sick: { total: 10, used: 1, remaining: 9 },
      personal: { total: 5, used: 0, remaining: 5 },
      unpaid: { total: 0, used: 0, remaining: 0 }
    }
  };
};

// ── Leave ─────────────────────────────────────────────────────────────────────

const LEAVE_KEY = "mock_leaves";

const getLeaveStore = () => {
  try {
    return JSON.parse(localStorage.getItem(LEAVE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const mockGetLeaveBalance = () => ({
  balance: {
    annual: { total: 20, used: 2, remaining: 18 },
    sick: { total: 10, used: 1, remaining: 9 },
    personal: { total: 5, used: 0, remaining: 5 }
  }
});

export const mockGetMyLeaves = () => {
  return { requests: getLeaveStore() };
};

export const mockApplyLeave = (formData) => {
  const leaves = getLeaveStore();
  const newLeave = {
    id: Date.now(),
    ...formData,
    status: "pending",
    applied_on: new Date().toISOString(),
    approved_by_name: null,
    total_days: formData.start_date && formData.end_date
      ? Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / 86400000) + 1
      : 1
  };
  leaves.unshift(newLeave);
  localStorage.setItem(LEAVE_KEY, JSON.stringify(leaves));
  return { request: newLeave };
};

// ── Mock Employees (Admin/HR use) ─────────────────────────────────────────────

const EMPLOYEES_KEY = "mock_employees";

const DEFAULT_EMPLOYEES = [
  { id: 1, employee_id: "EMP001", first_name: "John",    last_name: "Doe",      email: "john.doe@kravix.com",      role: "employee", position: "Software Engineer",    department_name: "Engineering",      phone: "+91 98765 43210", status: "active",    joining_date: "2023-03-10", employment_type: "Full-time", avatar: "JD" },
  { id: 2, employee_id: "EMP002", first_name: "Jane",    last_name: "Smith",    email: "jane.smith@kravix.com",    role: "hr",       position: "HR Manager",          department_name: "Human Resources",  phone: "+91 98765 43211", status: "active",    joining_date: "2021-06-01", employment_type: "Full-time", avatar: "JS" },
  { id: 3, employee_id: "EMP003", first_name: "Mike",    last_name: "Johnson",  email: "mike.j@kravix.com",        role: "employee", position: "Sales Lead",          department_name: "Sales",            phone: "+91 98765 43212", status: "on-leave",  joining_date: "2022-01-15", employment_type: "Full-time", avatar: "MJ" },
  { id: 4, employee_id: "EMP004", first_name: "Sarah",   last_name: "Wilson",   email: "sarah.w@kravix.com",       role: "employee", position: "Marketing Manager",   department_name: "Marketing",        phone: "+91 98765 43213", status: "active",    joining_date: "2022-08-20", employment_type: "Full-time", avatar: "SW" },
  { id: 5, employee_id: "EMP005", first_name: "David",   last_name: "Brown",    email: "david.b@kravix.com",       role: "employee", position: "Finance Analyst",     department_name: "Finance",          phone: "+91 98765 43214", status: "active",    joining_date: "2023-01-05", employment_type: "Full-time", avatar: "DB" },
  { id: 6, employee_id: "EMP006", first_name: "Emily",   last_name: "Davis",    email: "emily.d@kravix.com",       role: "employee", position: "Product Manager",     department_name: "Product",          phone: "+91 98765 43215", status: "active",    joining_date: "2022-11-12", employment_type: "Full-time", avatar: "ED" },
  { id: 7, employee_id: "EMP007", first_name: "Robert",  last_name: "Taylor",   email: "robert.t@kravix.com",      role: "employee", position: "DevOps Engineer",     department_name: "Engineering",      phone: "+91 98765 43216", status: "probation", joining_date: "2024-01-10", employment_type: "Full-time", avatar: "RT" },
  { id: 8, employee_id: "EMP008", first_name: "Lisa",    last_name: "Anderson", email: "lisa.a@kravix.com",        role: "employee", position: "UI/UX Designer",      department_name: "Product",          phone: "+91 98765 43217", status: "active",    joining_date: "2023-07-18", employment_type: "Full-time", avatar: "LA" },
  { id: 9, employee_id: "EMP009", first_name: "James",   last_name: "Martinez", email: "james.m@kravix.com",       role: "employee", position: "Data Analyst",        department_name: "Engineering",      phone: "+91 98765 43218", status: "active",    joining_date: "2023-05-22", employment_type: "Contract",  avatar: "JM" },
  { id: 10,employee_id: "EMP010", first_name: "Jessica", last_name: "Lee",      email: "jessica.l@kravix.com",     role: "employee", position: "Operations Manager",  department_name: "Operations",       phone: "+91 98765 43219", status: "inactive",  joining_date: "2021-03-08", employment_type: "Full-time", avatar: "JL" },
  { id: 11,employee_id: "EMP011", first_name: "Sarah",   last_name: "Connor",   email: "sarah.c@kravix.com",       role: "hr",       position: "HR Recruiter",          department_name: "Human Resources",  phone: "+91 98765 43220", status: "active",    joining_date: "2023-09-01", employment_type: "Full-time", avatar: "SC" },
  { id: 12,employee_id: "EMP012", first_name: "Michael", last_name: "Scott",    email: "michael.s@kravix.com",     role: "hr",       position: "HR Generalist",         department_name: "Human Resources",  phone: "+91 98765 43221", status: "probation", joining_date: "2024-02-15", employment_type: "Full-time", avatar: "MS" },
];

const getEmployeeStore = () => {
  try {
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  } catch { return DEFAULT_EMPLOYEES; }
};

const saveEmployeeStore = (data) => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(data));
};

export const mockGetAllEmployees = () => {
  const employees = getEmployeeStore();
  return { employees };
};

export const mockGetEmployeeById = (id) => {
  const employees = getEmployeeStore();
  const employee = employees.find(e => e.id === parseInt(id) || e.employee_id === id);
  if (!employee) throw new Error("Employee not found");
  return { employee };
};

export const mockCreateEmployee = (formData) => {
  const employees = getEmployeeStore();
  const newEmp = {
    id: Date.now(),
    employee_id: `EMP${String(employees.length + 1).padStart(3, "0")}`,
    first_name: formData.first_name || "",
    last_name: formData.last_name || "",
    email: formData.email || "",
    role: formData.role || "employee",
    position: formData.position || "",
    department_name: formData.department_name || formData.department || "",
    phone: formData.phone || "",
    status: "active",
    joining_date: formData.joining_date || new Date().toISOString().split("T")[0],
    employment_type: formData.employment_type || "Full-time",
    avatar: `${(formData.first_name || "U")[0]}${(formData.last_name || "U")[0]}`.toUpperCase()
  };
  employees.unshift(newEmp);
  saveEmployeeStore(employees);
  return { employee: newEmp, user: newEmp };
};

export const mockUpdateEmployee = (id, updates) => {
  const employees = getEmployeeStore();
  const idx = employees.findIndex(e => e.id === parseInt(id) || e.employee_id === id);
  if (idx === -1) throw new Error("Employee not found");
  employees[idx] = { ...employees[idx], ...updates };
  saveEmployeeStore(employees);
  return { employee: employees[idx] };
};

export const mockDeleteEmployee = (id) => {
  const employees = getEmployeeStore();
  const filtered = employees.filter(e => e.id !== parseInt(id) && e.employee_id !== id);
  saveEmployeeStore(filtered);
  return { message: "Employee deleted successfully" };
};
