import { useState, useEffect } from "react";
import AddEmployeeModal from "./AddEmployeeModal";
import PostJobModal from "./PostJobModal";
import RequestLeaveModal from "./RequestLeaveModal";
import RunBackupModal from "./RunBackupModal";
import GenerateReportModal from "./GenerateReportModal";
import ProcessPayrollModal from "./ProcessPayrollModal";

const ModalManager = () => {
  const [activeModals, setActiveModals] = useState({
    add_employee: false,
    post_job: false,
    request_leave: false,
    run_backup: false,
    generate_report: false,
    process_payroll: false,
  });

  useEffect(() => {
    const handleOpenModal = (e) => {
      const { modalType } = e.detail || {};
      if (modalType && modalType in activeModals) {
        setActiveModals((prev) => ({ ...prev, [modalType]: true }));
      }
    };

    window.addEventListener("open-modal", handleOpenModal);
    return () => window.removeEventListener("open-modal", handleOpenModal);
  }, [activeModals]);

  const handleClose = (modalType) => {
    setActiveModals((prev) => ({ ...prev, [modalType]: false }));
  };

  return (
    <>
      <AddEmployeeModal 
        isOpen={activeModals.add_employee} 
        onClose={() => handleClose("add_employee")} 
      />
      <PostJobModal 
        isOpen={activeModals.post_job} 
        onClose={() => handleClose("post_job")} 
      />
      <RequestLeaveModal 
        isOpen={activeModals.request_leave} 
        onClose={() => handleClose("request_leave")} 
      />
      <RunBackupModal 
        isOpen={activeModals.run_backup} 
        onClose={() => handleClose("run_backup")} 
      />
      <GenerateReportModal 
        isOpen={activeModals.generate_report} 
        onClose={() => handleClose("generate_report")} 
      />
      <ProcessPayrollModal 
        isOpen={activeModals.process_payroll} 
        onClose={() => handleClose("process_payroll")} 
      />
    </>
  );
};

export default ModalManager;
