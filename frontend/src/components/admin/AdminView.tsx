import React from 'react'
import LeftSection from './LeftSection'
import RightSection from './RightSection'

export default function AdminView() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Company Configuration</h2>
        <p className="text-gray-600 mt-2">
          Set up your company's expense management rules and approval workflow
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Half */}
        <div className="space-y-6">
          <LeftSection />
        </div>
        
        {/* Right Half */}
        <div className="space-y-6">
          <RightSection />
        </div>
      </div>
    </div>
  )
}