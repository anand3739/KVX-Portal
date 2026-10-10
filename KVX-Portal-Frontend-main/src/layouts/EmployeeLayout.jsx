import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { EMPLOYEE_NAVIGATION } from "../constants/navigation";
import { AdminThemeProvider, useAdminTheme } from "../contexts/AdminThemeContext";

const EmployeeLayoutInner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useAdminTheme();

  return (
    <div className="min-h-screen transition-all duration-500" style={{ background: 'transparent' }}>
      <Sidebar 
        navigation={EMPLOYEE_NAVIGATION} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        role="employee"
      />
      
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          role="employee"
        />
        
        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        

      </div>
    </div>
  );
};

const EmployeeLayout = () => (
  <AdminThemeProvider>
    <EmployeeLayoutInner />
  </AdminThemeProvider>
);

export default EmployeeLayout;