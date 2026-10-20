// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FarmerDashboard from "../components/dashboard/FarmerDashboard";
import LogisticsDashboard from "../components/dashboard/LogisticsDashboard";
import RetailerDashboard from "../components/dashboard/RetailerDashboard";
import { motion } from "framer-motion";
import { Users, Truck, Store, Loader } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const detectUserRole = () => {
      try {
        // First, check if user is authenticated
        if (!user) {
          console.log("No authenticated user, redirecting to login...");
          navigate("/login");
          return;
        }

        console.log("🔍 Detecting user role for:", user.email);

        // Get role from multiple sources (in order of priority)
        const urlParams = new URLSearchParams(window.location.search);
        const roleFromUrl = urlParams.get("role");

        // Get role from user metadata (from Supabase - this should be the main source)
        const roleFromMetadata = user.user_metadata?.role;

        // Get role from localStorage (fallback)
        const savedRole = localStorage.getItem("userRole");

        // Get role from signup process
        const signupRole = localStorage.getItem("signupRole");

        // DEBUG: Log all role sources
        console.log("📋 Role sources:", {
          roleFromUrl,
          roleFromMetadata,
          savedRole,
          signupRole,
        });

        // Determine the final role - PRIORITIZE METADATA FROM SUPABASE
        const finalRole =
          roleFromMetadata || roleFromUrl || savedRole || signupRole;

        console.log("🎯 Final detected role:", finalRole);

        if (!finalRole) {
          console.log("❌ No role detected, showing role selection");
          setUserRole(null);
        } else {
          setUserRole(finalRole);
          // Persist the role for future visits
          localStorage.setItem("userRole", finalRole);
        }
      } catch (error) {
        console.error("Error detecting user role:", error);
        setUserRole(null); // Show role selection on error
      } finally {
        setLoading(false);
      }
    };

    detectUserRole();
  }, [user, navigate]);

  const handleRoleSelect = (role) => {
    console.log("✅ User selected role:", role);
    setUserRole(role);
    localStorage.setItem("userRole", role);

    // Clear any signup role since we now have a definitive role
    localStorage.removeItem("signupRole");

    // Optional: You might want to update the user's metadata in Supabase here
    // updateUserRoleInSupabase(role);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mx-4"
        >
          <Loader className="w-10 h-10 text-slate-800 animate-spin mx-auto mb-4" />
          <p className="text-slate-800 font-semibold text-base">Loading workspace...</p>
          <p className="text-xs text-slate-500 mt-1">
            Verifying farmTrace session and roles
          </p>
        </motion.div>
      </div>
    );
  }

  // Show authentication required state
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full"
        >
          <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Session Required
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Please authenticate to access your farmTrace node dashboard.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition duration-150 w-full shadow-sm"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  // Role selection screen for users without a role
  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold mb-3">
              <span>Node Initialization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Welcome to farm<span className="text-emerald-600">Trace</span>, {user.user_metadata?.name || user.email}!
            </h1>
            <p className="text-base text-slate-600 max-w-xl mx-auto">
              Select your network role to initialize your operational dashboard.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "farmer",
                title: "Producer / Farm",
                description: "Cultivate, batch harvest, and issue tamper-proof QR tags",
                icon: Users,
                features: [
                  "Crop batch logging",
                  "QR code issuance",
                  "Harvest metrics",
                ],
              },
              {
                role: "logistics",
                title: "Logistics Fleet",
                description: "Cold-chain transit, GPS checkpoints, and handover verification",
                icon: Truck,
                features: [
                  "Transit logs",
                  "Temperature tracking",
                  "Checkpoint signoff",
                ],
              },
              {
                role: "retailer",
                title: "Retail Hub",
                description: "Product reception, authenticity check, and shelf provenance",
                icon: Store,
                features: [
                  "Batch verification",
                  "Stock management",
                  "Consumer provenance",
                ],
              },
            ].map((item) => (
              <motion.div
                key={item.role}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
                onClick={() => handleRoleSelect(item.role)}
              >
                <div>
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-5 text-slate-800">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {item.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-slate-500"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-between">
                  <span>Enter Dashboard</span>
                  <span>→</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  console.log("🚀 Rendering dashboard for role:", userRole);

  switch (userRole) {
    case "farmer":
      return <FarmerDashboard />;
    case "logistics":
      return <LogisticsDashboard />;
    case "retailer":
      return <RetailerDashboard />;
    default:
      console.warn("Unknown role, showing role selection");
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm">
            <p className="text-slate-700 text-sm mb-4">Unrecognized network role: <code className="font-mono text-xs">{userRole}</code></p>
            <button
              onClick={() => {
                localStorage.removeItem("userRole");
                setUserRole(null);
              }}
              className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              Reset Role
            </button>
          </div>
        </div>
      );
  }
};


export default Dashboard;
