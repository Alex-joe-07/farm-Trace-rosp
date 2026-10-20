import React from "react";
import { motion } from "framer-motion";

export default function AnimatedButton({ children, onClick, className = "", type = "button", disabled = false }) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 inline-flex items-center justify-center gap-2 ${
        className || "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </motion.button>
  );
}
