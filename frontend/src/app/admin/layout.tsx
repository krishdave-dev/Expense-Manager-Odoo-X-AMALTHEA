import React from "react";
import AdminHeader from "@/components/headers/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="mx-auto px-5 py-5">{children}</div>
    </div>
  );
}
