const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Fetching therapist_profiles...");
  const { data, error } = await supabase.from('therapist_profiles').select('*');
  if (error) {
    console.error("Error fetching therapist_profiles:", error);
  } else {
    console.log(`Found ${data.length} profiles.`);
    if (data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
      data.forEach((p, i) => {
        console.log(`\nProfile ${i + 1}:`);
        console.log(`- user_id: ${p.user_id}`);
        console.log(`- full_name: ${p.full_name}`);
        console.log(`- qualification: ${p.qualification}`);
        console.log(`- avatar_url: ${p.avatar_url}`);
        console.log(`- bio: ${p.bio}`);
      });
    }
  }
}
run();
