import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import {
  UserGroupIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

// Backend API base URL
const API_BASE_URL = "http://localhost:5000/api";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    role: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false); // New state for success notification
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when user starts typing
    if (error) setError("");
    if (name === "email" && emailError) setEmailError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // --- Validation Checks ---

    if (!formData.role) {
      setError("Please select your role");
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim().toLowerCase())) {
      setError("Please enter a valid email address (format: user@domain.com)");
      setLoading(false);
      return;
    }

    // Password validation (min 6 chars, letters, numbers)
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const hasLetters = /[a-zA-Z]/.test(formData.password);
    const hasNumbers = /[0-9]/.test(formData.password);

    if (!hasLetters || !hasNumbers) {
      setError("Password must contain both letters and numbers");
      setLoading(false);
      return;
    }

    // Business name validation for specific roles
    if (
      (formData.role === "farmer" ||
        formData.role === "logistics" ||
        formData.role === "retailer") &&
      !formData.businessName
    ) {
      setError("Business name is required for your selected role");
      setLoading(false);
      return;
    }

    // --- API Call ---
    try {
      console.log("🚀 Sending signup request to backend...");

      const requestData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.name.trim(),
        role: formData.role,
        businessName: formData.businessName?.trim() || "",
        location: formData.location?.trim() || "",
      };

      const response = await fetch(`${API_BASE_URL}/auth/admin-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log("📥 Response data:", result);

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            `Signup failed with status ${response.status}`
        );
      }

      console.log("✅ Backend signup successful:", result);

      // Store user role and navigate to dashboard
      localStorage.setItem("userRole", formData.role);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          name: formData.name,
          email: formData.email,
          businessName: formData.businessName,
          role: formData.role,
          location: formData.location,
        })
      );
      localStorage.setItem("isLoggedIn", "true");

      // SUCCESS HANDLING: Set success state and navigate after a delay
      console.log(`Welcome to OrganicTrace, ${formData.name}! Your ${formData.role} account has been created successfully. Navigating to dashboard.`);
      setSignupSuccess(true);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500); // 1.5 second delay to show the success message
    } catch (err) {
      console.error("💥 Signup error:", err);

      let errorMessage = err.message;

      if (err.message.includes("letters") && err.message.includes("numbers")) {
        errorMessage =
          "Password must contain both letters AND numbers (e.g., password123)";
      } else if (err.message.includes("already exists")) {
        errorMessage =
          "This email is already registered. Please use a different email.";
      } else if (err.message.includes("Validation failed")) {
        errorMessage = "Please check your input data.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check email availability on blur
  const handleEmailBlur = async () => {
    const email = formData.email.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;

    try {
      // API call to check email availability (placeholder)
      console.log("🔍 Checking email availability:", email);
    } catch (error) {
      // Silently fail - this is just a nice-to-have feature
      console.log("Email availability check failed:", error);
    }
  };

  const roleOptions = [
    {
      id: "farmer",
      label: "Farmer / Producer",
      description: "I grow or produce organic products",
      icon: UserGroupIcon,
      color: "emerald",
    },
    {
      id: "logistics",
      label: "Logistics Partner",
      description: "I transport and handle products",
      icon: TruckIcon,
      color: "blue",
    },
    {
      id: "retailer",
      label: "Retailer / Store",
      description: "I sell products to consumers",
      icon: BuildingStorefrontIcon,
      color: "purple",
    },
  ];

  // Helper function for dynamic classes
  const getRoleColorClass = (role, type) => {
    const colors = {
      emerald: {
        border: "border-emerald-500",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
      },
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
      },
      purple: {
        border: "border-purple-500",
        bg: "bg-purple-500/10",
        text: "text-purple-400",
      },
    };
    return colors[role.color]?.[type] || "";
  };

  const inputClass = "w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors duration-150 text-sm";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />

      <AnimatePresence mode="wait">
        {signupSuccess ? (
          /* SUCCESS MESSAGE VIEW */
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.4 }}
            className="bg-slate-900 rounded-3xl p-10 w-full max-w-2xl text-center shadow-2xl border border-slate-800 relative z-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Registration Successful
            </h2>
            <p className="text-slate-300 text-sm">
              Welcome to the network, <strong className="text-white">{formData.name}</strong>. Redirecting you to your node dashboard...
            </p>
          </motion.div>
        ) : (
          /* SIGNUP FORM VIEW */
          <motion.div
            key="signup-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 w-full max-w-2xl border border-slate-800 shadow-2xl relative z-10"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                <span>Network Registration</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                Join farm<span className="text-emerald-500">Trace</span>
              </h1>
              <p className="text-slate-400 text-sm">
                Create your verified identity and join the transparent supply chain.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400 mb-1">
                      {error.includes("already registered")
                        ? "Email Already Registered"
                        : "Signup Failed"}
                    </p>
                    <p className="text-sm text-red-300 mb-2">{error}</p>

                    {error.includes("already registered") && (
                      <div className="text-xs text-red-200 bg-red-600/20 p-2 rounded-lg mt-2">
                        <p className="font-medium mb-1">💡 What you can do:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Try a different email address</li>
                          <li>
                            <Link
                              to="/login"
                              className="text-red-200 hover:text-white underline font-medium"
                            >
                              Sign in here if you already have an account
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength="2"
                    className={inputClass}
                    placeholder="John Farmer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    required
                    className={inputClass}
                    placeholder="john@farm.com"
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-400">{emailError}</p>
                  )}
                </div>
              </div>

              {/* Password Input with Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password * (min. 6 chars, incl. letters & numbers)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className={`${inputClass} pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-400 focus:outline-none transition-colors duration-150"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Choose Your Role *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = formData.role === role.id;
                    const colorClass = getRoleColorClass(role, "border");
                    const bgClass = getRoleColorClass(role, "bg");
                    const textClass = getRoleColorClass(role, "text");

                    return (
                      <motion.div
                        key={role.id}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, role: role.id })}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? `${colorClass} ${bgClass} shadow-lg ring-2 ring-offset-2 ring-offset-gray-800 ${colorClass}`
                            : "border-gray-600 bg-gray-700/50 hover:border-emerald-500/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-7 h-7 ${textClass}`} />
                          {isSelected && (
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                          )}
                        </div>

                        <h3
                          className={`font-bold text-lg ${
                            isSelected ? "text-white" : "text-gray-200"
                          }`}
                        >
                          {role.label}
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                          {role.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Business Name Field */}
              {(formData.role === "farmer" ||
                formData.role === "logistics" ||
                formData.role === "retailer") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {formData.role === "farmer" && "Farm Name *"}
                    {formData.role === "logistics" && "Company Name *"}
                    {formData.role === "retailer" && "Store Name *"}
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    minLength="2"
                    className={inputClass}
                    placeholder={
                      formData.role === "farmer"
                        ? "Green Valley Organic Farms"
                        : formData.role === "logistics"
                        ? "Fresh Logistics Inc."
                        : "Organic Market"
                    }
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="City, State, Country"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || !formData.role || !formData.password}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </motion.button>

              {/* Login Link */}
              <p className="text-center text-gray-400 mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 underline font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </form>

            {/* Role Description Helper */}
            {!formData.role && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
              >
                <p className="text-sm text-blue-400 text-center">
                  💡 Select your role to continue. Your role determines which
                  features you can access (e.g., *Farmer* manages products, *Logistics* manages shipments).
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
