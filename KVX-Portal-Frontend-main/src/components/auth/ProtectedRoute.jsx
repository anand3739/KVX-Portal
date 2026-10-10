// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("🛡️ ProtectedRoute - Mounted/Updated:", {
      isAuthenticated,
      user,
      allowedRoles,
      path: window.location.pathname
    });
  }, [isAuthenticated, user, allowedRoles]);

  if (!isAuthenticated) {
    console.log("🛡️ Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    if (!user?.role) {
      console.log("🛡️ No user role found");
      return <Navigate to="/login" replace />;
    }
    
    if (!allowedRoles.includes(user.role)) {
      console.log(`🛡️ Role ${user.role} not allowed, redirecting`);
      const dashboardPaths = {
        ceo: '/ceo/dashboard',
        admin: '/admin/dashboard',
        hr: '/hr/dashboard',
        employee: '/employee/dashboard'
      };
      return <Navigate to={dashboardPaths[user.role] || '/login'} replace />;
    }
  }

  console.log("🛡️ Access granted, rendering outlet");
  return <Outlet />;
};

export default ProtectedRoute;