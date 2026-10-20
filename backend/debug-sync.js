// debug-sync.js
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log("🔧 Supabase Config:");
console.log("URL:", supabaseUrl);
console.log("Key exists:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSync() {
  try {
    console.log("\n🔍 STEP 1: Checking Auth Users...");

    // Method 1: Using admin API
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.log("❌ Admin API error:", authError);
    } else {
      console.log(`✅ Found ${authUsers.users.length} users via Admin API:`);
      authUsers.users.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.email} (${user.id}) - Role: ${
            user.user_metadata?.role || "none"
          }`
        );
      });
    }

    console.log("\n🔍 STEP 2: Checking Users Table...");
    const { data: tableUsers, error: tableError } = await supabase
      .from("users")
      .select("*");

    if (tableError) {
      console.log("❌ Users table error:", tableError);
    } else {
      console.log(`✅ Found ${tableUsers.length} users in users table:`);
      tableUsers.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.email} (${user.id}) - Role: ${
            user.role || "none"
          }`
        );
      });
    }

    console.log("\n🔍 STEP 3: Finding Missing Users...");
    if (authUsers && tableUsers) {
      const authEmails = new Set(authUsers.users.map((u) => u.email));
      const tableEmails = new Set(tableUsers.map((u) => u.email));

      const missingEmails = [...authEmails].filter(
        (email) => !tableEmails.has(email)
      );

      console.log(`📊 Missing ${missingEmails.length} users from table:`);
      missingEmails.forEach((email, index) => {
        console.log(`   ${index + 1}. ${email}`);
      });

      // Sync missing users
      if (missingEmails.length > 0) {
        console.log("\n🔄 Syncing missing users...");
        for (const email of missingEmails) {
          const authUser = authUsers.users.find((u) => u.email === email);
          if (authUser) {
            // Update the userRecord in debug-sync.js - remove the status field
            const userRecord = {
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name || "",
              role: authUser.user_metadata?.role || "user",
              business_name: authUser.user_metadata?.business_name || "",
              location: authUser.user_metadata?.location || "",
              created_at: authUser.created_at,
              // REMOVE: status: 'active'
            };

            const { error: insertError } = await supabase
              .from("users")
              .insert([userRecord]);

            if (insertError) {
              console.log(`❌ Failed to sync ${email}:`, insertError.message);
            } else {
              console.log(`✅ Synced: ${email}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log("💥 Debug error:", error);
  }
}

debugSync();
