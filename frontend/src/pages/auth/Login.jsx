import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../config/supabase";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const demoAccounts = {
    farmer: { email: "farmer@farmtrace.com", password: "Farmer@123", role: "farmer" },
    logistics: { email: "logistics@farmtrace.com", password: "Logistics@123", role: "logistics" },
    retailer: { email: "retailer@farmtrace.com", password: "Retailer@123", role: "retailer" },
  };

  const handleInstantDemo = async (roleKey) => {
    const target = demoAccounts[roleKey];
    if (!target) return;
    setFormData({ email: target.email, password: target.password });
    setError("");
    setLoading(true);
    setActiveDemoRole(roleKey);

    try {
      console.log(`⚡ Instant Demo Logging in as ${roleKey}...`);
      const result = await login(target.email, target.password);
      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }
      if (result.user) {
        localStorage.setItem("userRole", result.user.user_metadata?.role || target.role);
        localStorage.setItem("userData", JSON.stringify(result.user));
        localStorage.setItem("isLoggedIn", "true");
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Instant demo login error:", err);
      setError(err.message || "Failed to log in with demo account");
    } finally {
      setLoading(false);
      setActiveDemoRole(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demoParam = params.get("demo") || params.get("role");
    if (demoParam && demoAccounts[demoParam.toLowerCase()]) {
      handleInstantDemo(demoParam.toLowerCase());
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login with Supabase...");

      const requestData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      console.log("📤 Sending login request:", requestData);

      const result = await login(requestData.email, requestData.password);

      console.log("📥 Login result:", result);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      console.log("✅ Login successful:", result);

      // Store user session data
      if (result.user) {
        localStorage.setItem(
          "userRole",
          result.user.user_metadata?.role || "user"
        );
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: result.user.id,
            email: result.user.email,
            name: result.user.user_metadata?.name,
            role: result.user.user_metadata?.role,
            business_name: result.user.user_metadata?.business_name,
            location: result.user.user_metadata?.location,
          })
        );
        localStorage.setItem("isLoggedIn", "true");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);

      let errorMessage = err.message;

      if (err.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address before logging in.";
      } else if (err.message.includes("Validation failed")) {
        errorMessage = "Please check your input data.";
      } else if (
        err.message.includes("network") ||
        err.message.includes("fetch")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.message.includes("rate limit")) {
        errorMessage = "Too many login attempts. Please try again later.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Just send the reset email - Supabase will handle the validation
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // If there's an error, it means the email doesn't exist or there's another issue
        if (error.message.includes("user not found")) {
          throw new Error("No account found with this email address.");
        }
        throw error;
      }

      // If no error, the email was sent successfully
      setResetSent(true);
      setError("");
    } catch (err) {
      console.error("❌ Password reset error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background subtle grid pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-slate-800 shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
          >
            <KeyIcon className="w-7 h-7 text-emerald-400" />
          </motion.div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <span>farmTrace Node</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1.5">
            {forgotPasswordMode ? "Reset Password" : "Sign In to Workspace"}
          </h1>
          <p className="text-xs text-slate-400">
            {forgotPasswordMode
              ? "Enter your email to receive recovery instructions"
              : "Access your decentralized farmTrace node"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400 mb-1">
                  {forgotPasswordMode ? "Reset Failed" : "Login Failed"}
                </p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Message for Password Reset */}
        {resetSent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
          >
            <div className="flex items-start space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-400 mb-1">
                  Reset Email Sent
                </p>
                <p className="text-sm text-emerald-300">
                  Check your email for password reset instructions.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 1-Click Instant Demo Access */}
        {!forgotPasswordMode && (
          <div className="mb-6 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                ⚡ 1-Click Instant Demo Login
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Direct Entry
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleInstantDemo("farmer")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 ${
                  activeDemoRole === "farmer"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30"
                    : "bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl mb-1">🌾</span>
                <span className="text-xs font-bold">Farmer</span>
                <span className="text-[10px] text-slate-400">
                  {activeDemoRole === "farmer" ? "Entering..." : "Producer"}
                </span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleInstantDemo("logistics")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 ${
                  activeDemoRole === "logistics"
                    ? "bg-blue-500/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/30"
                    : "bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl mb-1">🚚</span>
                <span className="text-xs font-bold">Logistics</span>
                <span className="text-[10px] text-slate-400">
                  {activeDemoRole === "logistics" ? "Entering..." : "Fleet"}
                </span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleInstantDemo("retailer")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 ${
                  activeDemoRole === "retailer"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/30"
                    : "bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl mb-1">🏬</span>
                <span className="text-xs font-bold">Retailer</span>
                <span className="text-[10px] text-slate-400">
                  {activeDemoRole === "retailer" ? "Entering..." : "Store"}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Click any role above to automatically authenticate into that dashboard
            </p>
          </div>
        )}

        {/* Login Form */}
        {!forgotPasswordMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(true)}
                  className="text-sm text-emerald-500 hover:text-emerald-400 transition duration-200"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition duration-200"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
        ) : (
          /* Forgot Password Form */
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={loading || resetSent}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <motion.button
                type="button"
                onClick={() => setForgotPasswordMode(false)}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                Back to Login
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading || resetSent}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : resetSent ? (
                  "Email Sent"
                ) : (
                  "Send Reset Link"
                )}
              </motion.button>
            </div>
          </form>
        )}

        {/* Signup Link */}
        {!forgotPasswordMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-700/50"
          >
            <p className="text-center text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-emerald-500 hover:text-emerald-400 underline font-medium transition duration-200"
              >
                Create one here
              </Link>
            </p>
          </motion.div>
        )}

        {/* Security Info */}
        <div className="mt-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-xs text-gray-400 text-center">
            🔐 Secure authentication powered by Supabase
          </p>
        </div>
      </motion.div>
    </div>
  );
}
