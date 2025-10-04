import React from "react";
import CreateUserTable from "@/components/admin/createuser/CreateUserTable";

export default function CreateUserPage() {
  return (
    <div className="w-full space-y-5">
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Create and manage users in your organization
        </p>
      </div>

      <CreateUserTable />
    </div>
  );
}
