import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use service key for admin operations, anon key for client operations
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  throw new Error("Supabase URL and Service Key are required");
}

console.log("🔧 Supabase Config:", {
  url: supabaseUrl ? "✅ Set" : "❌ Missing",
  key: supabaseKey ? "✅ Set" : "❌ Missing",
});

// Create Supabase client with service key for admin privileges
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Simplified user creation - the trigger will handle the users table
export const createUserWithProfile = async (userData) => {
  try {
    const { email, password, name, role, businessName, location } = userData;

    console.log("🔧 Creating user:", { email, name, role });

    const cleanEmail = email.trim().toLowerCase();

    // Create user in Auth - the trigger will automatically create the users table record
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          name: name.trim(),
          role: role,
          business_name: businessName?.trim() || "",
          location: location?.trim() || "",
        },
      },
    });

    if (authError) {
      console.error("❌ Auth creation failed:", authError);
      return {
        success: false,
        error: authError.message,
        code: authError.code,
      };
    }

    console.log("✅ Auth user created:", authData.user?.id);
    
    // Wait a moment for the trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Verify the user was created in the users table
    if (authData.user) {
      const { data: userRecord, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (fetchError) {
        console.warn("⚠️ User might not be in users table yet:", fetchError.message);
      } else {
        console.log("✅ User confirmed in users table:", userRecord.id);
      }
    }

    return {
      success: true,
      user: authData.user,
    };
  } catch (error) {
    console.error("💥 User creation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Sync existing users (one-time use)
export const syncAuthUsersToTable = async () => {
  try {
    console.log("🔄 Starting user sync...");

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Failed to list auth users:", authError);
      return { success: false, error: authError.message };
    }

    console.log(`📋 Found ${authUsers.users.length} users in Auth`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const authUser of authUsers.users) {
      try {
        const userRecord = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || "",
          role: authUser.user_metadata?.role || "user",
          business_name: authUser.user_metadata?.business_name || "",
          location: authUser.user_metadata?.location || "",
          created_at: authUser.created_at,
        };

        // Use upsert to handle existing users
        const { error: upsertError } = await supabase
          .from("users")
          .upsert([userRecord], { onConflict: 'id' });

        if (upsertError) {
          console.error(`❌ Failed to sync ${authUser.email}:`, upsertError.message);
          errorCount++;
        } else {
          console.log(`✅ Synced user: ${authUser.email}`);
          syncedCount++;
        }
      } catch (userError) {
        console.error(`❌ Error syncing user ${authUser.email}:`, userError);
        errorCount++;
      }
    }

    console.log(`🎉 Sync completed: ${syncedCount} users synced, ${errorCount} errors`);
    return { 
      success: true, 
      syncedCount, 
      errorCount,
      totalUsers: authUsers.users.length
    };
  } catch (error) {
    console.error("💥 Sync error:", error);
    return { success: false, error: error.message };
  }
};

export const testConnection = async () => {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      return { success: false, message: error.message, details: error };
    }
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export default {
  supabase,
  createUserWithProfile,
  syncAuthUsersToTable,
  testConnection,
};