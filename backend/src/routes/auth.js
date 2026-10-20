// routes/auth.js - COMPLETE FILE
import express from "express";
import {
  supabase,
  createUserWithProfile,
  syncAuthUsersToTable,
} from "../config/supabase.js";
import { validateSignup, validateLogin } from "../middleware/validation.js";

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Available endpoints
router.get("/endpoints", (req, res) => {
  res.json({
    success: true,
    endpoints: [
      "GET /api/auth/health",
      "GET /api/auth/endpoints",
      "POST /api/auth/admin-signup",
      "POST /api/auth/login",
      "GET /api/auth/profile",
      "POST /api/auth/logout",
      "POST /api/auth/sync-users", // This should be here
    ],
  });
});

// In routes/auth.js - REPLACE the admin-signup endpoint
router.post("/admin-signup", validateSignup, async (req, res) => {
  try {
    const { email, password, name, role, businessName, location } = req.body;

    console.log("📝 Signup request:", { email, name, role });

    // Use the enhanced function that saves to BOTH auth and table
    const result = await createUserWithProfile({
      email: email.trim().toLowerCase(),
      password: password,
      name: name.trim(),
      role: role,
      businessName: businessName?.trim() || "",
      location: location?.trim() || "",
    });

    console.log("📊 User creation result:", result);

    if (result.success) {
      console.log(
        "✅ User created successfully in both Auth and table:",
        result.user?.id
      );

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.user_metadata?.name,
          role: result.user?.user_metadata?.role,
          business_name: result.user?.user_metadata?.business_name,
          location: result.user?.user_metadata?.location,
        },
        warning: result.warning, // Will show if there was any issue with table save
      });
    } else {
      console.error("❌ User creation failed:", result.error);
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("💥 Signup error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during signup",
    });
  }
});

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (error) {
      console.error("❌ Login failed:", error.message);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    console.log("✅ Login successful:", data.user.id);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        role: data.user.user_metadata?.role,
        business_name: data.user.user_metadata?.business_name,
        location: data.user.user_metadata?.location,
      },
    });
  } catch (error) {
    console.error("💥 Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Profile
router.get("/profile", async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Profile endpoint",
    });
  } catch (error) {
    console.error("💥 Profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("💥 Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// 🔄 SYNC EXISTING USERS ROUTE - ADD THIS
router.post("/sync-users", async (req, res) => {
  try {
    console.log("🔄 Starting user sync...");
    await syncAuthUsersToTable();
    res.json({
      success: true,
      message: "User sync completed successfully",
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    res.status(500).json({
      success: false,
      error: "Sync failed: " + error.message,
    });
  }
});

// Add this temporary route to routes/auth.js
router.post("/force-sync", async (req, res) => {
  try {
    console.log("🔄 Starting FORCED user sync...");

    // Get all auth users
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error("Failed to list auth users: " + authError.message);
    }

    console.log(`📋 Found ${authUsers.users.length} users in Auth`);

    let syncedCount = 0;
    let errorCount = 0;

    // Force insert ALL auth users (ignore existing checks)
    for (const authUser of authUsers.users) {
      const userRecord = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || "",
        role: authUser.user_metadata?.role || "user",
        business_name: authUser.user_metadata?.business_name || "",
        location: authUser.user_metadata?.location || "",
        status: "active",
        created_at: authUser.created_at,
      };

      // Use upsert to handle duplicates
      const { error: upsertError } = await supabase
        .from("users")
        .upsert([userRecord], { onConflict: "id" });

      if (upsertError) {
        console.error(`❌ Failed to upsert ${authUser.email}:`, upsertError);
        errorCount++;
      } else {
        console.log(`✅ Upserted user: ${authUser.email}`);
        syncedCount++;
      }
    }

    res.json({
      success: true,
      message: `Force sync completed: ${syncedCount} users processed, ${errorCount} errors`,
      totalUsers: authUsers.users.length,
      syncedCount,
      errorCount,
    });
  } catch (error) {
    console.error("💥 Force sync error:", error);
    res.status(500).json({
      success: false,
      error: "Force sync failed: " + error.message,
    });
  }
});

export default router;
