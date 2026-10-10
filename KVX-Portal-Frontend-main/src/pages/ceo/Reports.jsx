import { useState } from "react";
import { FileText, Download, TrendingUp, Users, DollarSign, Calendar, Building2 } from "lucide-react";

const Reports = () => {
  const reports = [
    { id: 1, name: "Company Performance", type: "Executive Summary", date: "Mar 14, 2026", icon: TrendingUp },
    { id: 2, name: "Employee Growth", type: "HR Report", date: "Mar 13, 2026", icon: Users },
    { id: 3, name: "Financial Overview", type: "Q1 2026", date: "Mar 10, 2026", icon: DollarSign },
    { id: 4, name: "Department Analytics", type: "Monthly", date: "Mar 08, 2026", icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Icon className="h-6 w-6 text-purple-600" />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Download className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{report.type}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {report.date}
                </span>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;