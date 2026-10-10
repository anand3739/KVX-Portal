import { useState } from "react";
import { Building2, Users, TrendingUp, DollarSign, Plus } from "lucide-react";

const Departments = () => {
  const departments = [
    { id: 1, name: "Engineering", head: "John Smith", employees: 45, budget: "$2.5M", performance: 94 },
    { id: 2, name: "Marketing", head: "Sarah Johnson", employees: 28, budget: "$1.2M", performance: 88 },
    { id: 3, name: "Sales", head: "Mike Wilson", employees: 35, budget: "$1.8M", performance: 92 },
    { id: 4, name: "Human Resources", head: "Emma Davis", employees: 12, budget: "$0.8M", performance: 90 },
    { id: 5, name: "Finance", head: "Robert Brown", employees: 15, budget: "$1.0M", performance: 95 },
    { id: 6, name: "Operations", head: "Lisa Anderson", employees: 22, budget: "$1.5M", performance: 87 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                {dept.performance}%
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{dept.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Head: {dept.head}</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Employees</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  {dept.employees}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Budget</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                  {dept.budget}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;