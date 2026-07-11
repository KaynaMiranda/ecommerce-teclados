const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://fhwcitwqjpyjolrgktfs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZod2NpdHdxanB5am9scmdrdGZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MjIyMTgsImV4cCI6MjA5OTI5ODIxOH0.s7l42tX8iPKj_kQrYEsEjy6b0dAweJ69BX-v9zhlnP8'
);

async function main() {
  const { data, error } = await s.from('profiles').select('user_id, full_name, is_admin');
  console.log('PROFILES:', JSON.stringify(data, null, 2));
  if (error) console.log('ERROR:', JSON.stringify(error));
}

main();
