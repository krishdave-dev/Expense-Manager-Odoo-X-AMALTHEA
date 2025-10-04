"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, FileText, UserCheck } from 'lucide-react'

interface Manager {
  id: string
  name: string
  email: string
}

export default function LeftSection() {
  const [userName, setUserName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedManager, setSelectedManager] = useState('')
  const [managers, setManagers] = useState<Manager[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock managers data (in real app, fetch from backend)
  useEffect(() => {
    const mockManagers: Manager[] = [
      { id: '1', name: 'John Smith', email: 'john.smith@company.com' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
      { id: '3', name: 'Michael Brown', email: 'michael.brown@company.com' },
      { id: '4', name: 'Emily Davis', email: 'emily.davis@company.com' },
      { id: '5', name: 'David Wilson', email: 'david.wilson@company.com' }
    ]
    setManagers(mockManagers)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Left Section Data:', {
        userName,
        description,
        selectedManager
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          User Configuration
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              User
            </label>
            <Input
              type="text"
              placeholder="Enter user name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description about rules
            </label>
            <textarea
              placeholder="Enter description about rules and policies..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Describe the rules and policies for expense approvals
            </p>
          </div>

          {/* Manager Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Manager
            </label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            >
              <option value="">Select a manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Choose the manager who will oversee expense approvals
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}