"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const generateTemporaryPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate temporary password
      const tempPassword = generateTemporaryPassword();

      // Store temporary password in localStorage (in real app, this would be sent to backend)
      localStorage.setItem(
        "tempPassword",
        JSON.stringify({
          email: email,
          password: tempPassword,
          timestamp: Date.now(),
          used: false,
        })
      );

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real application, you would send this to your backend to send email
      console.log("Temporary password sent to:", email);
      console.log("Temporary password:", tempPassword);

      setIsEmailSent(true);
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a temporary password to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              A temporary password has been sent to:
            </p>
            <p className="font-medium text-blue-900 mt-1">{email}</p>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>• Check your inbox and spam folder</p>
            <p>• Use the temporary password to log in</p>
            <p>• You'll be prompted to create a new password</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
              Go to Login
            </Button>
          </Link>

          <button
            onClick={() => {
              setIsEmailSent(false);
              setEmail("");
            }}
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            Didn't receive email? Try again
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Forgot Password?
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter your email address and we'll send you a temporary password
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You'll receive a temporary password via
              email. Use it to log in and you'll be prompted to create a new
              password.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {isLoading ? "Sending..." : "Send Temporary Password"}
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
