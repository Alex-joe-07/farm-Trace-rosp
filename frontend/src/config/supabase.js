import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
  
  throw new Error(
    'Supabase environment variables are missing. ' +
    'Please check your .env file and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error.message);
  } else {
    console.log('✓ Supabase connected successfully');
  }
});