import React from "react";
import UserHeader from "@/components/headers/UserHeader";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      {/* Main Content */}
      <div className="mx-auto px-5 py-5">{children}</div>
    </div>
  );
}
