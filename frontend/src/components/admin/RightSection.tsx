"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCheck, Users, Percent } from "lucide-react";

interface Approver {
  id: string;
  name: string;
  email: string;
  required: boolean;
}

export default function RightSection() {
  const [isManagerApprover, setIsManagerApprover] = useState(false);
  const [approveSequence, setApproveSequence] = useState(false);
  const [minApprovalPercentage, setMinApprovalPercentage] = useState("");
  const [approvers, setApprovers] = useState<Approver[]>([]);

  // Mock approvers data (in real app, fetch from backend)
  useEffect(() => {
    const mockApprovers: Approver[] = [
      {
        id: "1",
        name: "Alice Cooper",
        email: "alice.cooper@company.com",
        required: true,
      },
      {
        id: "2",
        name: "Bob Johnson",
        email: "bob.johnson@company.com",
        required: false,
      },
      {
        id: "3",
        name: "Carol Smith",
        email: "carol.smith@company.com",
        required: true,
      },
      {
        id: "4",
        name: "David Lee",
        email: "david.lee@company.com",
        required: false,
      },
      {
        id: "5",
        name: "Eva Martinez",
        email: "eva.martinez@company.com",
        required: true,
      },
    ];
    setApprovers(mockApprovers);
  }, []);

  const handleRequiredChange = (approverId: string, required: boolean) => {
    setApprovers(
      approvers.map((approver) =>
        approver.id === approverId ? { ...approver, required } : approver
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Right Section Data:", {
      isManagerApprover,
      approvers,
      approveSequence,
      minApprovalPercentage,
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Approvers
          </CardTitle>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Is manager an approver?
            </label>
            <input
              type="checkbox"
              checked={isManagerApprover}
              onChange={(e) => setIsManagerApprover(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Approvers Table */}
          <div className="space-y-3">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-16 text-center font-semibold">
                      Sr No.
                    </TableHead>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="w-24 text-center font-semibold">
                      Required
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvers.map((approver, index) => (
                    <TableRow key={approver.id} className="hover:bg-gray-50">
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {approver.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {approver.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={approver.required}
                          onChange={(e) =>
                            handleRequiredChange(approver.id, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {approvers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No approvers found</p>
                <p className="text-sm">
                  Add users to the system to see them here
                </p>
              </div>
            )}
          </div>

          {/* Approve Sequence Checkbox */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="approveSequence"
              checked={approveSequence}
              onChange={(e) => setApproveSequence(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="approveSequence"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Approve Sequence
            </label>
            <span className="text-xs text-gray-500 ml-auto">
              Enable sequential approval workflow
            </span>
          </div>

          {/* Minimum Approval Percentage */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Minimum Approval Percentage
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter percentage"
                value={minApprovalPercentage}
                onChange={(e) => setMinApprovalPercentage(e.target.value)}
                min="0"
                max="100"
                className="pr-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">
                %
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Minimum percentage of approvers required to approve an expense
              (0-100%)
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Save Approval Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
