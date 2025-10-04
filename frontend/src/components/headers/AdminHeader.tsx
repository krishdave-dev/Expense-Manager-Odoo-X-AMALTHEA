"use client";

import React from "react";
import Link from "next/link";
import { Users, LogOut, User } from "lucide-react";
import { useAuth } from '@/lib/auth-context';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
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
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700">
                {user?.name || 'Admin User'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}