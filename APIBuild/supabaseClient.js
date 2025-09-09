// supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// No need to import or configure dotenv.
// Your build tool will handle these variables.
const supabaseUrl = process.env.process.env.SUPABASE_URL  

const supabaseKey = process.env.process.env.SUPABASE_ANON_KEY;

// No need for a server-side check (process.exit)
// The browser will log an error if keys are missing.
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase environment variables are missing!");
}

// These lines are for debugging and can be removed in production
console.log("🔑 Supabase URL:", supabaseUrl);
console.log("🔑 Supabase Key:", supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

