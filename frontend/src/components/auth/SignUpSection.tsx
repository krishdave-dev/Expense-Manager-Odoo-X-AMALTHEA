"use client";

import React, { useState, useEffect } from "react";
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
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Globe,
  Search,
  ChevronDown,
} from "lucide-react";

interface Country {
  name: {
    common: string;
    official: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}

interface SelectedCountry {
  name: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

export default function SignUpSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: null as SelectedCountry | null,
  });

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,currencies"
        );
        const data: Country[] = await response.json();

        // Filter out countries without currencies and sort alphabetically
        const validCountries = data
          .filter(
            (country) =>
              country.currencies && Object.keys(country.currencies).length > 0
          )
          .sort((a, b) => a.name.common.localeCompare(b.name.common));

        setCountries(validCountries);
        setFilteredCountries(validCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback to some default countries if API fails
        const fallbackCountries: Country[] = [
          {
            name: {
              common: "United States",
              official: "United States of America",
            },
            currencies: { USD: { name: "United States dollar", symbol: "$" } },
          },
          {
            name: { common: "India", official: "Republic of India" },
            currencies: { INR: { name: "Indian rupee", symbol: "₹" } },
          },
        ];
        setCountries(fallbackCountries);
        setFilteredCountries(fallbackCountries);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter((country) =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm, countries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".country-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCountrySelect = (country: Country) => {
    const currencyCode = Object.keys(country.currencies)[0];
    const currency = country.currencies[currencyCode];

    const selectedCountry: SelectedCountry = {
      name: country.name.common,
      currency: {
        code: currencyCode,
        name: currency.name,
        symbol: currency.symbol,
      },
    };

    setFormData({
      ...formData,
      country: selectedCountry,
    });
    setIsDropdownOpen(false);
    setSearchTerm("");

    // Set currency in environment/localStorage for later use
    localStorage.setItem(
      "baseCurrency",
      JSON.stringify(selectedCountry.currency)
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.country) {
      alert("Please select a country!");
      return;
    }

    // Handle signup logic here
    console.log("Signup data:", {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      baseCurrency: formData.country.currency,
    });
  };

  return (
    <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Create Account
        </CardTitle>
        <CardDescription className="text-gray-600">
          Join us to start managing your expenses
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <div className="relative country-dropdown">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
              <div className="relative">
                <Input
                  type="text"
                  placeholder={
                    loading ? "Loading countries..." : "Search for a country"
                  }
                  value={formData.country ? formData.country.name : searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={loading}
                  required
                />
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />

                {isDropdownOpen && filteredCountries.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCountries.slice(0, 10).map((country) => {
                      const currencyCode = Object.keys(country.currencies)[0];
                      const currency = country.currencies[currencyCode];

                      return (
                        <div
                          key={country.name.common}
                          onClick={() => handleCountrySelect(country)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {country.name.common}
                            </span>
                            <span className="text-xs text-gray-500">
                              {currency.symbol} {currencyCode}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Currency: {currency.name}
                          </div>
                        </div>
                      );
                    })}
                    {filteredCountries.length > 10 && (
                      <div className="px-3 py-2 text-xs text-gray-500 text-center bg-gray-50">
                        Showing first 10 results. Continue typing to refine...
                      </div>
                    )}
                  </div>
                )}

                {isDropdownOpen &&
                  searchTerm &&
                  filteredCountries.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No countries found matching &quot;{searchTerm}&quot;
                      </div>
                    </div>
                  )}
              </div>

              {formData.country && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <div className="text-xs text-blue-700">
                    <strong>Selected:</strong> {formData.country.name}
                  </div>
                  <div className="text-xs text-blue-600">
                    <strong>Base Currency:</strong>{" "}
                    {formData.country.currency.name} (
                    {formData.country.currency.symbol}{" "}
                    {formData.country.currency.code})
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col my-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
