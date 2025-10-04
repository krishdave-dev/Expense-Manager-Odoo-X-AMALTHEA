'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
  Mail,
  User as UserIcon,
  Shield,
  Building,
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit3,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient, User, CreateUserData } from '@/lib/api-client';

export default function AdminView() {
  const { user, company, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showManagerDialog, setShowManagerDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [managerAssignLoading, setManagerAssignLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedCurrentRole, setSelectedCurrentRole] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE' | ''>('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE'>('EMPLOYEE');
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);
  
  const [newUserData, setNewUserData] = useState<CreateUserData>({
    name: '',
    email: '',
    role: 'EMPLOYEE',
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response.users);
    } catch (error: any) {
      setError(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newUserData.name || !newUserData.email || !newUserData.role) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setCreateUserLoading(true);
      const response = await apiClient.createUser(newUserData);
      
      // Handle different response scenarios
      if (response.tempPassword) {
        // Email failed, show manual credentials
        setSuccessMessage(
          `User created successfully! Email delivery failed. Please share these credentials manually:\n\n` +
          `Email: ${newUserData.email}\n` +
          `Temporary Password: ${response.tempPassword}\n\n` +
          `The user will need to change this password on first login.`
        );
      } else {
        // Email sent successfully
        setSuccessMessage(`User created successfully! Temporary password has been sent to ${newUserData.email}`);
      }
      
      setNewUserData({ name: '', email: '', role: 'EMPLOYEE' });
      setShowCreateUser(false);
      
      // Reload users list
      await loadUsers();
      
      // Clear success message after 10 seconds (longer for manual credentials)
      setTimeout(() => setSuccessMessage(''), 10000);
    } catch (error: any) {
      setError(error.message || 'Failed to create user');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await apiClient.updateUserStatus(userId, !currentStatus);
      
      // Show appropriate success message based on response
      if (response.emailSent) {
        setSuccessMessage('User activated successfully and temporary password email sent!');
      } else if (response.emailSent === false && response.emailError) {
        setSuccessMessage('User status updated successfully, but email delivery failed. Please share credentials manually.');
      } else {
        setSuccessMessage(response.message || 'User status updated successfully');
      }
      
      await loadUsers(); // Reload users
      
      // Clear success message after 10 seconds
      setTimeout(() => setSuccessMessage(''), 10000);
    } catch (error: any) {
      setError(error.message || 'Failed to update user status');
    }
  };

  const handleAssignManager = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setShowManagerDialog(true);
  };

  const handleManagerAssignment = async (managerId: number) => {
    if (!selectedEmployeeId) return;

    try {
      setManagerAssignLoading(true);
      setError('');
      
      const response = await apiClient.assignManager(selectedEmployeeId, managerId);
      setSuccessMessage(response.message || 'Manager assigned successfully!');
      
      await loadUsers(); // Reload users to show updated manager assignments
      setShowManagerDialog(false);
      setSelectedEmployeeId(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      setError(error.message || 'Failed to assign manager');
    } finally {
      setManagerAssignLoading(false);
    }
  };

  const handleRemoveManager = async (employeeId: number, managerId: number) => {
    try {
      setError('');
      const response = await apiClient.removeManager(employeeId, managerId);
      setSuccessMessage(response.message || 'Manager removed successfully!');
      
      await loadUsers(); // Reload users to show updated manager assignments
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      setError(error.message || 'Failed to remove manager');
    }
  };

  const handleRoleChange = (userId: number, currentRole: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    setSelectedUserId(userId);
    setSelectedCurrentRole(currentRole);
    setNewRole(currentRole); // Default to current role
    setShowRoleDialog(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUserId || !newRole) return;

    try {
      setRoleUpdateLoading(true);
      setError('');
      
      const response = await apiClient.updateUserRole(selectedUserId, newRole);
      setSuccessMessage(response.message || 'User role updated successfully!');
      
      await loadUsers(); // Reload users to show updated roles
      setShowRoleDialog(false);
      setSelectedUserId(null);
      setSelectedCurrentRole('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      setError(error.message || 'Failed to update user role');
    } finally {
      setRoleUpdateLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'EMPLOYEE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Button onClick={logout} variant="outline">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-green-800 whitespace-pre-line font-mono text-sm">{successMessage}</div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError('')}
              className="ml-auto"
            >
              ×
            </Button>
          </div>
        )}

        {/* Company Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company?.name || 'Company Name'}</div>
              <p className="text-xs text-muted-foreground">{company?.country || 'Country'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base Currency</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {company?.currency?.symbol || '$'} {company?.currency?.code || 'USD'}
              </div>
              <p className="text-xs text-muted-foreground">Primary currency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Active and inactive users</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage company users and their permissions
                </CardDescription>
              </div>
              <Button onClick={() => setShowCreateUser(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell className="font-medium">{userItem.name}</TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>
                        {userItem.id !== user.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRoleChange(userItem.id, userItem.role)}
                              className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${getRoleBadgeColor(userItem.role)}`}
                              title="Click to change role"
                            >
                              {userItem.role}
                            </button>
                            <Edit3 className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                          </div>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                            {userItem.role}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(userItem.isActive)}`}>
                          {userItem.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {userItem.managers && userItem.managers.length > 0 ? (
                          <div className="space-y-1">
                            {userItem.managers.map((manager, index) => (
                              <div key={manager.id} className="flex items-center justify-between">
                                <span className="text-sm">{manager.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveManager(userItem.id, manager.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">No manager</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAssignManager(userItem.id)}
                              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full"
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {userItem.createdAt ? 
                          new Date(userItem.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {userItem.id !== user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={userItem.isActive}
                            onClick={() => handleUserStatusToggle(userItem.id, userItem.isActive)}
                          >
                            {userItem.isActive ? 'Active' : 'Activate'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. A temporary password will be generated and sent via email.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter full name"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="pl-10"
                    required
                    disabled={createUserLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="pl-10"
                    required
                    disabled={createUserLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as 'ADMIN' | 'MANAGER' | 'EMPLOYEE' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={createUserLoading}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> A temporary password will be generated and sent to the user's email address. 
                  They will be required to change it on first login.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateUser(false)}
                disabled={createUserLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUserLoading}
              >
                {createUserLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Manager Dialog */}
      <Dialog open={showManagerDialog} onOpenChange={setShowManagerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Manager</DialogTitle>
            <DialogDescription>
              Select a manager to assign to this employee. Only users with MANAGER or ADMIN roles can be assigned as managers.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Available Managers</label>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {users
                  .filter(u => 
                    (u.role === 'MANAGER' || u.role === 'ADMIN') && 
                    u.id !== selectedEmployeeId &&
                    u.isActive
                  )
                  .map((manager) => (
                    <div
                      key={manager.id}
                      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{manager.name}</div>
                        <div className="text-sm text-gray-500">{manager.email}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(manager.role)}`}>
                          {manager.role}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleManagerAssignment(manager.id)}
                        disabled={managerAssignLoading}
                      >
                        {managerAssignLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Assign'
                        )}
                      </Button>
                    </div>
                  ))}
                {users.filter(u => 
                  (u.role === 'MANAGER' || u.role === 'ADMIN') && 
                  u.id !== selectedEmployeeId &&
                  u.isActive
                ).length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No available managers found. Only active users with MANAGER or ADMIN roles can be assigned as managers.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowManagerDialog(false);
                setSelectedEmployeeId(null);
              }}
              disabled={managerAssignLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for this user. Changing from MANAGER role will remove all manager-employee relationships.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Current Role</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(selectedCurrentRole)}`}>
                  {selectedCurrentRole}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'MANAGER' | 'EMPLOYEE')}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={roleUpdateLoading}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {selectedCurrentRole === 'MANAGER' && newRole !== 'MANAGER' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Changing from MANAGER role will remove all manager-employee relationships for this user.
                </p>
              </div>
            )}

            {newRole === 'ADMIN' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Caution:</strong> ADMIN role grants full system access including user management and company settings.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRoleDialog(false);
                setSelectedUserId(null);
                setSelectedCurrentRole('');
              }}
              disabled={roleUpdateLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleUpdate}
              disabled={roleUpdateLoading || newRole === selectedCurrentRole}
            >
              {roleUpdateLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Role...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
