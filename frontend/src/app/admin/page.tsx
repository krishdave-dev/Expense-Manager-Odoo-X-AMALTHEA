<<<<<<< HEAD
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminView from '@/components/admin/AdminView';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminView />
    </ProtectedRoute>
  );
}
=======
import React from "react";
import AdminViewPage from "@/components/pages/admin/admin-view-page";

export default function Admin() {
  return <AdminViewPage />;
}
>>>>>>> 5e2d66944e57a1444fc015f39a9df52dee717f3b
