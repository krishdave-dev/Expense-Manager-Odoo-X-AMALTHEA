import React from "react";
import Link from "next/link";
import { ClipboardList, Settings, LogOut, User } from "lucide-react";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Manager
              </h1>
              <p className="text-sm text-gray-600">Manager Dashboard</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-4">
                <Link
                  href="/manager"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200 h-10"
                >
                  <ClipboardList className="h-4 w-4" />
                  Approvals
                </Link>
                <Link
                  href="/manager/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200 h-10"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </nav>

              {/* User Info */}
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Manager User</span>
                </div>
                <button className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors duration-200 h-10">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-5 py-5">{children}</div>
    </div>
  );
}
