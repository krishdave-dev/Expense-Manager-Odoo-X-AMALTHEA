import React from "react";
import ManagerHeader from "@/components/headers/ManagerHeader";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />
      {/* Main Content */}
      <div className="mx-auto px-5 py-5">{children}</div>
    </div>
  );
}
