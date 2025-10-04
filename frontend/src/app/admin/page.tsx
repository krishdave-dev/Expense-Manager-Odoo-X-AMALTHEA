import ProtectedRoute from '@/components/ProtectedRoute';
import AdminView from '@/components/admin/AdminView';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminView />
    </ProtectedRoute>
  );
}