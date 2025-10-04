import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Manager
              </h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/createuser"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors duration-200 h-10"
              >
                <Users className="h-4 w-4" />
                Create User
              </Link>
              <span className="text-sm text-gray-500">Welcome, Admin</span>
              <button className="text-sm text-purple-600 hover:text-purple-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto px-5 py-5">{children}</div>
    </div>
  );
}
