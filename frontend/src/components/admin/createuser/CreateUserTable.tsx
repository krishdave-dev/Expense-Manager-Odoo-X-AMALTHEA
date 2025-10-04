"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Plus, 
  Send, 
  Search, 
  ChevronDown, 
  Check, 
  X,
  Edit,
  Trash2
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'Manager' | 'Employee'
  managerId?: string
}

interface NewUserRow {
  id: string
  userId?: string
  userName: string
  role: 'Manager' | 'Employee'
  managerId: string
  managerName: string
  email: string
  isNew: boolean
  isEditing: boolean
}

interface ExistingUser {
  id: string
  name: string
  email: string
}

export default function CreateUserTable() {
  const [userRows, setUserRows] = useState<NewUserRow[]>([])
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([])
  const [managers, setManagers] = useState<User[]>([])
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({})
  const [managerSearchTerms, setManagerSearchTerms] = useState<{ [key: string]: string }>({})
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({})
  const [managerDropdownOpen, setManagerDropdownOpen] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})

  // Mock data for existing users
  useEffect(() => {
    const mockExistingUsers: ExistingUser[] = [
      { id: '1', name: 'John Doe', email: 'john.doe@company.com' },
      { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com' },
      { id: '3', name: 'Bob Johnson', email: 'bob.johnson@company.com' },
      { id: '4', name: 'Alice Cooper', email: 'alice.cooper@company.com' },
      { id: '5', name: 'Charlie Brown', email: 'charlie.brown@company.com' }
    ]
    setExistingUsers(mockExistingUsers)

    const mockManagers: User[] = [
      { id: '1', name: 'Sarah Manager', email: 'sarah.manager@company.com', role: 'Manager' },
      { id: '2', name: 'Mike Lead', email: 'mike.lead@company.com', role: 'Manager' },
      { id: '3', name: 'Lisa Director', email: 'lisa.director@company.com', role: 'Manager' }
    ]
    setManagers(mockManagers)
  }, [])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addNewUserRow = () => {
    const newRow: NewUserRow = {
      id: generateId(),
      userName: '',
      role: 'Employee',
      managerId: '',
      managerName: '',
      email: '',
      isNew: true,
      isEditing: true
    }
    setUserRows([...userRows, newRow])
  }

  const updateUserRow = (rowId: string, field: keyof NewUserRow, value: string | boolean) => {
    setUserRows(userRows.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ))
  }

  const deleteUserRow = (rowId: string) => {
    setUserRows(userRows.filter(row => row.id !== rowId))
    // Clean up related state
    const newSearchTerms = { ...searchTerms }
    const newManagerSearchTerms = { ...managerSearchTerms }
    const newDropdownOpen = { ...dropdownOpen }
    const newManagerDropdownOpen = { ...managerDropdownOpen }
    delete newSearchTerms[rowId]
    delete newManagerSearchTerms[rowId]
    delete newDropdownOpen[rowId]
    delete newManagerDropdownOpen[rowId]
    setSearchTerms(newSearchTerms)
    setManagerSearchTerms(newManagerSearchTerms)
    setDropdownOpen(newDropdownOpen)
    setManagerDropdownOpen(newManagerDropdownOpen)
  }

  const handleUserSearch = (rowId: string, searchTerm: string) => {
    setSearchTerms({ ...searchTerms, [rowId]: searchTerm })
    setDropdownOpen({ ...dropdownOpen, [rowId]: true })
    updateUserRow(rowId, 'userName', searchTerm)
  }

  const handleManagerSearch = (rowId: string, searchTerm: string) => {
    setManagerSearchTerms({ ...managerSearchTerms, [rowId]: searchTerm })
    setManagerDropdownOpen({ ...managerDropdownOpen, [rowId]: true })
    updateUserRow(rowId, 'managerName', searchTerm)
  }

  const selectExistingUser = (rowId: string, user: ExistingUser) => {
    updateUserRow(rowId, 'userId', user.id)
    updateUserRow(rowId, 'userName', user.name)
    updateUserRow(rowId, 'email', user.email)
    updateUserRow(rowId, 'isNew', false)
    setSearchTerms({ ...searchTerms, [rowId]: user.name })
    setDropdownOpen({ ...dropdownOpen, [rowId]: false })
  }

  const selectExistingManager = (rowId: string, manager: User) => {
    updateUserRow(rowId, 'managerId', manager.id)
    updateUserRow(rowId, 'managerName', manager.name)
    setManagerSearchTerms({ ...managerSearchTerms, [rowId]: manager.name })
    setManagerDropdownOpen({ ...managerDropdownOpen, [rowId]: false })
  }

  const createNewUser = (rowId: string, name: string) => {
    updateUserRow(rowId, 'userName', name)
    updateUserRow(rowId, 'isNew', true)
    setSearchTerms({ ...searchTerms, [rowId]: name })
    setDropdownOpen({ ...dropdownOpen, [rowId]: false })
  }

  const createNewManager = (rowId: string, name: string) => {
    updateUserRow(rowId, 'managerName', name)
    updateUserRow(rowId, 'managerId', 'new-' + generateId())
    setManagerSearchTerms({ ...managerSearchTerms, [rowId]: name })
    setManagerDropdownOpen({ ...managerDropdownOpen, [rowId]: false })
  }

  const getFilteredUsers = (rowId: string) => {
    const searchTerm = searchTerms[rowId] || ''
    if (!searchTerm) return existingUsers
    return existingUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getFilteredManagers = (rowId: string) => {
    const searchTerm = managerSearchTerms[rowId] || ''
    if (!searchTerm) return managers
    return managers.filter(manager => 
      manager.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const sendPassword = async (rowId: string) => {
    const row = userRows.find(r => r.id === rowId)
    if (!row || !row.email) {
      alert('Please enter a valid email address first!')
      return
    }

    setIsLoading({ ...isLoading, [rowId]: true })
    
    try {
      const tempPassword = generatePassword()
      
      // Simulate API call to send email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`Password sent to ${row.email}:`, tempPassword)
      alert(`Temporary password sent to ${row.email}!\nPassword: ${tempPassword}`)
      
    } catch (error) {
      console.error('Error sending password:', error)
      alert('Failed to send password. Please try again.')
    } finally {
      setIsLoading({ ...isLoading, [rowId]: false })
    }
  }

  const saveUserRow = (rowId: string) => {
    const row = userRows.find(r => r.id === rowId)
    if (!row) return

    if (!row.userName || !row.email) {
      alert('Please fill in all required fields!')
      return
    }

    updateUserRow(rowId, 'isEditing', false)
    console.log('Saving user:', row)
  }

  const editUserRow = (rowId: string) => {
    updateUserRow(rowId, 'isEditing', true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Create Users
          </CardTitle>
          <Button 
            onClick={addNewUserRow}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New User
          </Button>
        </div>
        <p className="text-gray-600">
          Add new users to your organization and assign roles and managers
        </p>
      </CardHeader>

      <CardContent>
        <div className="border rounded-lg overflow-visible">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Manager</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold text-center">Password</TableHead>
                <TableHead className="font-semibold w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No users added yet</p>
                    <p className="text-sm">Click &quot;New User&quot; to get started</p>
                  </TableCell>
                </TableRow>
              ) : (
                userRows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    {/* User Column - Smart Dropdown */}
                    <TableCell className="relative">
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            value={searchTerms[row.id] || row.userName}
                            onChange={(e) => handleUserSearch(row.id, e.target.value)}
                            onFocus={() => setDropdownOpen({ ...dropdownOpen, [row.id]: true })}
                            placeholder="Search or create user..."
                            className="border-none shadow-none p-0 h-auto focus:ring-0"
                            disabled={!row.isEditing}
                          />
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        {dropdownOpen[row.id] && row.isEditing && (
                          <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {getFilteredUsers(row.id).map((user) => (
                              <div
                                key={user.id}
                                onClick={() => selectExistingUser(row.id, user)}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            ))}
                            {searchTerms[row.id] && getFilteredUsers(row.id).length === 0 && (
                              <div
                                onClick={() => createNewUser(row.id, searchTerms[row.id])}
                                className="px-3 py-2 hover:bg-green-50 cursor-pointer text-green-700 border-b border-gray-100"
                              >
                                <div className="flex items-center gap-2">
                                  <Plus className="h-4 w-4" />
                                  Create new user &quot;{searchTerms[row.id]}&quot;
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Role Column */}
                    <TableCell>
                      <select
                        value={row.role}
                        onChange={(e) => updateUserRow(row.id, 'role', e.target.value as 'Manager' | 'Employee')}
                        disabled={!row.isEditing}
                        className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </TableCell>

                    {/* Manager Column - Smart Dropdown */}
                    <TableCell className="relative">
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            value={managerSearchTerms[row.id] || row.managerName}
                            onChange={(e) => handleManagerSearch(row.id, e.target.value)}
                            onFocus={() => setManagerDropdownOpen({ ...managerDropdownOpen, [row.id]: true })}
                            placeholder="Search or create manager..."
                            className="border-none shadow-none p-0 h-auto focus:ring-0"
                            disabled={!row.isEditing}
                          />
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        {managerDropdownOpen[row.id] && row.isEditing && (
                          <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {getFilteredManagers(row.id).map((manager) => (
                              <div
                                key={manager.id}
                                onClick={() => selectExistingManager(row.id, manager)}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{manager.name}</div>
                                <div className="text-xs text-gray-500">{manager.email}</div>
                              </div>
                            ))}
                            {managerSearchTerms[row.id] && getFilteredManagers(row.id).length === 0 && (
                              <div
                                onClick={() => createNewManager(row.id, managerSearchTerms[row.id])}
                                className="px-3 py-2 hover:bg-green-50 cursor-pointer text-green-700 border-b border-gray-100"
                              >
                                <div className="flex items-center gap-2">
                                  <Plus className="h-4 w-4" />
                                  Create new manager &quot;{managerSearchTerms[row.id]}&quot;
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Email Column */}
                    <TableCell>
                      <Input
                        type="email"
                        value={row.email}
                        onChange={(e) => updateUserRow(row.id, 'email', e.target.value)}
                        placeholder="user@company.com"
                        disabled={!row.isEditing}
                        className="border-none shadow-none p-0 h-auto focus:ring-0 disabled:bg-transparent"
                      />
                    </TableCell>

                    {/* Password Column */}
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() => sendPassword(row.id)}
                        disabled={isLoading[row.id] || !row.email || row.isEditing}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isLoading[row.id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Password
                      </Button>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {row.isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => saveUserRow(row.id)}
                              className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteUserRow(row.id)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => editUserRow(row.id)}
                              variant="outline"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteUserRow(row.id)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {userRows.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Quick Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Search for existing users or create new ones on the fly</li>
              <li>• Click the send button to email a temporary password to new users</li>
              <li>• Edit user details by clicking the edit button</li>
              <li>• Users will receive login credentials via email</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}