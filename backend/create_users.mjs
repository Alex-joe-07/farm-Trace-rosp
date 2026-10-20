import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xybebizhmltyqqrtnyur.supabase.co';
// Using the anon key (service key in .env is same as anon)
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YmViaXpobWx0eXFxcnRueXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MTQ3ODEsImV4cCI6MjEwNzI5MDc4MX0.w3uT79r3vR9AoTp3GfIDKpZTOeFF5nTJX7aq91bGSls';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const users = [
  {
    email: 'farmer@farmtrace.com',
    password: 'Farmer@123',
    name: 'Demo Farmer',
    role: 'farmer',
    business_name: 'Green Valley Farm',
    location: 'Punjab, India',
  },
  {
    email: 'logistics@farmtrace.com',
    password: 'Logistics@123',
    name: 'Demo Logistics',
    role: 'logistics',
    business_name: 'FastMove Logistics',
    location: 'Delhi, India',
  },
  {
    email: 'retailer@farmtrace.com',
    password: 'Retailer@123',
    name: 'Demo Retailer',
    role: 'retailer',
    business_name: 'FreshMart Store',
    location: 'Mumbai, India',
  },
];

async function createUsers() {
  for (const user of users) {
    console.log(`\nCreating user: ${user.email} (${user.role})`);

    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name,
          role: user.role,
          business_name: user.business_name,
          location: user.location,
        },
      },
    });

    if (error) {
      console.error(`  ERROR: ${error.message}`);
      continue;
    }

    console.log(`  Auth user created: ${data.user?.id}`);

    // Wait for trigger to create users table record
    await new Promise(r => setTimeout(r, 1500));

    // Check if users table entry was created by trigger
    const { data: userRecord, error: fetchErr } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', user.email)
      .single();

    if (fetchErr) {
      console.warn(`  Warning - trigger may not have fired, inserting manually...`);
      const { error: insertErr } = await supabase.from('users').upsert({
        id: data.user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        business_name: user.business_name,
        location: user.location,
      });
      if (insertErr) {
        console.error(`  Failed to insert users record: ${insertErr.message}`);
      } else {
        console.log(`  Manually inserted users record`);
      }
    } else {
      console.log(`  Users table record: ${userRecord.email} (${userRecord.role})`);
    }
  }

  console.log('\n\n========= DONE =========');
  console.log('Login credentials:');
  console.log('');
  users.forEach(u => {
    console.log(`Role     : ${u.role.toUpperCase()}`);
    console.log(`Email    : ${u.email}`);
    console.log(`Password : ${u.password}`);
    console.log('------------------------');
  });
}

createUsers().catch(console.error);
