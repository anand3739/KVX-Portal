import { useState } from "react";
import { Shield, Lock, AlertCircle, CheckCircle, Globe, Smartphone, Users } from "lucide-react";

const Security = () => {
  const securityEvents = [
    { id: 1, event: "Failed Login Attempts", count: 23, severity: "high", time: "Last 24h" },
    { id: 2, event: "API Access", count: 1245, severity: "low", time: "Last 24h" },
    { id: 3, event: "Permission Changes", count: 12, severity: "medium", time: "Last 7d" },
    { id: 4, event: "New Device Logins", count: 45, severity: "medium", time: "Last 7d" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Security Overview</h1>

      {/* Security Score */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Security Score</p>
            <p className="text-4xl font-bold mt-2">94/100</p>
            <p className="text-purple-100 text-sm mt-1">Excellent - All systems secure</p>
          </div>
          <Shield className="h-16 w-16 text-purple-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Events */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Events</h2>
          <div className="space-y-4">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{event.event}</p>
                  <p className="text-sm text-gray-500">{event.time}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.severity === 'high' ? 'bg-red-100 text-red-700' :
                    event.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {event.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">US - New York</p>
                  <p className="text-xs text-gray-500">Chrome • 192.168.1.100</p>
                </div>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">UK - London</p>
                  <p className="text-xs text-gray-500">Firefox • 10.0.0.45</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;