// debug-sync-fixed.js
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Supabase Config:');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSyncFixed() {
  try {
    console.log('\n🔍 STEP 1: Checking Auth Users...');
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Admin API error:', authError);
      return;
    }

    console.log(`✅ Found ${authUsers.users.length} users via Admin API:`);
    authUsers.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id}) - Role: ${user.user_metadata?.role || 'none'}`);
    });

    console.log('\n🔍 STEP 2: Checking Users Table...');
    const { data: tableUsers, error: tableError } = await supabase
      .from('users')
      .select('*');

    if (tableError) {
      console.log('❌ Users table error:', tableError);
      return;
    }

    console.log(`✅ Found ${tableUsers.length} users in users table:`);
    tableUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id}) - Role: ${user.role || 'none'}`);
    });

    console.log('\n🔍 STEP 3: Finding Missing Users...');
    const authEmails = new Set(authUsers.users.map(u => u.email));
    const tableEmails = new Set(tableUsers.map(u => u.email));
    
    const missingEmails = [...authEmails].filter(email => !tableEmails.has(email));
    
    console.log(`📊 Missing ${missingEmails.length} users from table:`);
    missingEmails.forEach((email, index) => {
      console.log(`   ${index + 1}. ${email}`);
    });

    // Sync missing users WITHOUT status field
    if (missingEmails.length > 0) {
      console.log('\n🔄 Syncing missing users (without status field)...');
      for (const email of missingEmails) {
        const authUser = authUsers.users.find(u => u.email === email);
        if (authUser) {
          const userRecord = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || '',
            role: authUser.user_metadata?.role || 'user',
            business_name: authUser.user_metadata?.business_name || '',
            location: authUser.user_metadata?.location || '',
            created_at: authUser.created_at
            // REMOVED: status field
          };

          console.log('Inserting record:', userRecord);

          const { error: insertError } = await supabase
            .from('users')
            .insert([userRecord]);

          if (insertError) {
            console.log(`❌ Failed to sync ${email}:`, insertError.message);
          } else {
            console.log(`✅ Synced: ${email}`);
          }
        }
      }
    }

    // Final check
    console.log('\n🔍 FINAL CHECK:');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*');

    if (!finalError) {
      console.log(`🎉 Total users in table now: ${finalUsers.length}`);
    }

  } catch (error) {
    console.log('💥 Debug error:', error);
  }
}

debugSyncFixed();