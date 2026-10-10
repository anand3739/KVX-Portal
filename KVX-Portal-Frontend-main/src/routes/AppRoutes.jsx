import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useSelector } from "react-redux";
import LoadingScreen from "../components/common/LoadingScreen";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// ========== AUTH PAGES ==========
const Login = lazy(() => import("../pages/auth/Login"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));

// ========== LAYOUTS ==========
const CEOLayout = lazy(() => import("../layouts/CEOLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const HRLayout = lazy(() => import("../layouts/HRLayout"));
const EmployeeLayout = lazy(() => import("../layouts/EmployeeLayout"));

const Mailbox = lazy(() => import("../pages/common/Mailbox"));
const ChatSystem = lazy(() => import("../pages/common/ChatSystem"));
const TaskBoard = lazy(() => import("../pages/common/TaskBoard"));
const Designations = lazy(() => import("../pages/common/Designations"));
const Tickets = lazy(() => import("../pages/common/Tickets"));
const Events = lazy(() => import("../pages/common/Events"));

// ========== CEO PAGES ==========
const CEODashboard = lazy(() => import("../pages/ceo/CEODashboard"));
const CompanyAnalytics = lazy(() => import("../pages/ceo/CompanyAnalytics"));
const FinancialOverview = lazy(() => import("../pages/ceo/FinancialOverview"));
const PerformanceReports = lazy(() => import("../pages/ceo/PerformanceReports"));
const CEOEmployees = lazy(() => import("../pages/ceo/Employees"));
const CEODepartments = lazy(() => import("../pages/ceo/Departments"));
const CEOSecurity = lazy(() => import("../pages/ceo/Security"));
const CEOReports = lazy(() => import("../pages/ceo/Reports"));
const CEOSettings = lazy(() => import("../pages/ceo/Settings"));

// ========== ADMIN PAGES ==========
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const EmployeeManagement = lazy(() => import("../pages/admin/EmployeeManagement"));
const HrManagement = lazy(() => import("../pages/admin/HrManagement"));
const Departments = lazy(() => import("../pages/admin/Departments"));
const Permissions = lazy(() => import("../pages/admin/Permissions"));
const SystemLogs = lazy(() => import("../pages/admin/SystemLogs"));
const Notifications = lazy(() => import("../pages/admin/Notifications"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const Settings = lazy(() => import("../pages/admin/Settings"));
const AuditLogs = lazy(() => import("../pages/admin/AuditLogs"));
const BackupManagement = lazy(() => import("../pages/admin/BackupManagement"));
const ApiKeys = lazy(() => import("../pages/admin/ApiKeys"));
const Security = lazy(() => import("../pages/admin/Security"));
const Integrations = lazy(() => import("../pages/admin/Integrations"));
const Announcements = lazy(() => import("../pages/admin/Announcements"));
const HelpCenter = lazy(() => import("../pages/admin/HelpCenter"));

// ========== HR PAGES ==========
const HRDashboard = lazy(() => import("../pages/hr/HRDashboard"));
const Recruitment = lazy(() => import("../pages/hr/Recruitment"));
const PayrollManagement = lazy(() => import("../pages/hr/PayrollManagement"));
const LeaveRequests = lazy(() => import("../pages/hr/LeaveRequests"));
const AttendanceManagement = lazy(() => import("../pages/hr/AttendanceManagement"));
const Training = lazy(() => import("../pages/hr/Training"));
const PerformanceReviews = lazy(() => import("../pages/hr/PerformanceReviews"));
const HRReports = lazy(() => import("../pages/hr/HRReports"));
const HRSettings = lazy(() => import("../pages/hr/HRSettings"));
const HRProfile = lazy(() => import("../pages/hr/HRProfile"));
const ExcelSheetsFolder = lazy(() => import("../pages/hr/ExcelSheetsFolder"));
const HrLeaves = lazy(() => import("../pages/hr/HrLeavesFolder"));
const HRNotifications = lazy(() => import("../pages/hr/HRNotifications"));

// ========== EMPLOYEE PAGES ==========
const EmployeeDashboard = lazy(() => import("../pages/employee/EmployeeDashboard"));
const MyProfile = lazy(() => import("../pages/admin/MyProfile"));
const Attendance = lazy(() => import("../pages/employee/Attendance"));
const Documents = lazy(() => import("../pages/employee/Documents"));
const LeaveApplication = lazy(() => import("../pages/employee/LeaveApplication"));
const Tasks = lazy(() => import("../pages/employee/Tasks"));
const Learning = lazy(() => import("../pages/employee/Learning"));
const EmployeeMailbox = lazy(() => import("../pages/employee/Mailbox"));
const EmployeeSettings = lazy(() => import("../pages/employee/Settings"));

// ========== EMPLOYEE MANAGEMENT COMPONENTS ==========
const EmployeeDirectory = lazy(() => import("../pages/employees/EmployeeDirectory"));
const EmployeeProfile = lazy(() => import("../pages/employees/EmployeeProfile"));
const AddEmployee = lazy(() => import("../pages/employees/AddEmployee"));
const EditEmployee = lazy(() => import("../pages/employees/EditEmployee"));

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ========== CEO ROUTES ========== */}
        <Route element={<ProtectedRoute allowedRoles={['ceo']} />}>
          <Route element={<CEOLayout />}>
            <Route path="/ceo/dashboard" element={<CEODashboard />} />
            <Route path="/ceo/analytics" element={<CompanyAnalytics />} />
            <Route path="/ceo/financial" element={<FinancialOverview />} />
            <Route path="/ceo/performance" element={<PerformanceReports />} />
            <Route path="/ceo/employees" element={<CEOEmployees />} />
            <Route path="/ceo/departments" element={<CEODepartments />} />
            <Route path="/ceo/security" element={<CEOSecurity />} />
            <Route path="/ceo/reports" element={<CEOReports />} />
            <Route path="/ceo/settings" element={<CEOSettings />} />
            <Route path="/ceo/mailbox" element={<Mailbox role="ceo" />} />
            <Route path="/ceo/mailbox/:id" element={<Mailbox role="ceo" />} />
            <Route path="/ceo/chat" element={<ChatSystem role="ceo" />} />
            <Route path="/ceo/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* ========== ADMIN ROUTES ========== */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<EmployeeManagement />} />
            <Route path="/admin/employees/add" element={<AddEmployee />} />
            <Route path="/admin/employees/:id" element={<EmployeeProfile />} />
            <Route path="/admin/employees/:id/edit" element={<EditEmployee />} />
            <Route path="/admin/hr" element={<HrManagement />} />
            <Route path="/admin/hr/add" element={<AddEmployee />} />
            <Route path="/admin/hr/:id" element={<EmployeeProfile />} />
            <Route path="/admin/hr/:id/edit" element={<EditEmployee />} />
            <Route path="/admin/hr-management" element={<HRDashboard />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/roles" element={<Permissions />} />
            <Route path="/admin/permissions" element={<Permissions />} />
            <Route path="/admin/logs" element={<SystemLogs />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/security" element={<Security />} />
            <Route path="/admin/backup" element={<BackupManagement />} />
            <Route path="/admin/api" element={<ApiKeys />} />
            <Route path="/admin/integrations" element={<Integrations />} />
            <Route path="/admin/mailbox" element={<Mailbox role="admin" />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/help" element={<HelpCenter />} />
            <Route path="/admin/profile" element={<MyProfile />} />
            <Route path="/admin/change-password" element={<ChangePassword />} />
            <Route path="/admin/chat" element={<ChatSystem role="admin" />} />
            <Route path="/admin/tasks" element={<TaskBoard role="admin" />} />
            <Route path="/admin/designations" element={<Designations role="admin" />} />
            <Route path="/admin/tickets" element={<Tickets role="admin" />} />
            <Route path="/admin/events" element={<Events role="admin" />} />
          </Route>
        </Route>

        {/* ========== HR ROUTES ========== */}
        <Route element={<ProtectedRoute allowedRoles={['hr']} />}>
          <Route element={<HRLayout />}>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/recruitment" element={<Recruitment />} />
            <Route path="/hr/employees" element={<EmployeeDirectory />} />
            <Route path="/hr/employees/add" element={<AddEmployee />} />
            <Route path="/hr/employees/:id" element={<EmployeeProfile />} />
            <Route path="/hr/employees/:id/edit" element={<EditEmployee />} />
            <Route path="/hr/attendance" element={<AttendanceManagement />} />
            <Route path="/hr/leave" element={<LeaveRequests />} />
            <Route path="/hr/payroll" element={<PayrollManagement />} />
            <Route path="/hr/performance" element={<PerformanceReviews />} />
            <Route path="/hr/training" element={<Training />} />
            <Route path="/hr/reports" element={<HRReports />} />
            <Route path="/hr/notifications" element={<HRNotifications />} />
            <Route path="/hr/mailbox" element={<Mailbox role="hr" />} />
            <Route path="/hr/chat" element={<ChatSystem role="hr" />} />
            <Route path="/hr/profile" element={<HRProfile />} />
            <Route path="/hr/excel-sheets" element={<ExcelSheetsFolder />} />
            <Route path="/hr/leaves" element={<HrLeaves />} />
            <Route path="/hr/settings" element={<HRSettings />} />
            <Route path="/hr/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* ========== EMPLOYEE ROUTES ========== */}
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<Attendance />} />
            <Route path="/employee/leave" element={<LeaveApplication />} />
            <Route path="/employee/documents" element={<Documents />} />
            <Route path="/employee/tasks" element={<Tasks />} />
            <Route path="/employee/learning" element={<Learning />} />
            <Route path="/employee/mailbox" element={<EmployeeMailbox />} />
            <Route path="/employee/chat" element={<ChatSystem role="employee" />} />
            <Route path="/employee/settings" element={<EmployeeSettings />} />
            <Route path="/employee/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* ========== 404 ========== */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;