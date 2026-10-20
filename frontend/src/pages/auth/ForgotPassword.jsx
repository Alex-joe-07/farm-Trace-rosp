// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
    } else {
      setMessage("Check your email for the password reset link!");
      setMessageType("success");
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-inter">
      <motion.form
        onSubmit={handleReset}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gray-800/90 backdrop-blur-sm p-10 rounded-xl shadow-2xl w-full max-w-sm border border-amber-500/50"
      >
        <h2 className="text-3xl font-extrabold mb-2 text-center text-white tracking-wide">
          Reset Password
        </h2>
        
        <p className="text-gray-400 text-center mb-8 text-sm">
          Enter your email and we'll send you a reset link
        </p>

        {message && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg mb-6 text-sm font-medium ${
              messageType === "error" 
                ? "text-red-400 bg-red-900/30" 
                : "text-amber-400 bg-amber-900/30"
            }`}
          >
            {message}
          </motion.p>
        )}

        {/* Email Input */}
        <label htmlFor="email" className="block mb-2 font-medium text-gray-300">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
          placeholder="you@farm.com"
          required
        />

        {/* Reset Password Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ 
            scale: loading ? 1 : 1.02, 
            boxShadow: loading ? "none" : "0 8px 25px rgba(245, 158, 11, 0.6)" 
          }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-3 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
              Sending Reset Link...
            </div>
          ) : (
            "Send Reset Link"
          )}
        </motion.button>

        {/* Back to Login Link */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Remember your password?{" "}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 underline transition duration-200">
            Back to Login
          </Link>
        </p>

        {/* Additional Help Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600"
        >
          <p className="text-xs text-gray-400 text-center">
            <strong>Note:</strong> Check your spam folder if you don't see the email within a few minutes.
          </p>
        </motion.div>
      </motion.form>
    </div>
  );
}