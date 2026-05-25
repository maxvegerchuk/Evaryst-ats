// Runs the team_id migration via Supabase management API.
// Requires SUPABASE_SERVICE_ROLE_KEY env var (Settings → API in Supabase dashboard).
// Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/add-team-id.mjs

import { createClient } from '@supabase/supabase-js'

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var first.')
  console.error('Get it from: Supabase dashboard → Settings → API → service_role key')
  process.exit(1)
}

const supabase = createClient(
  'https://gbzcirwpjhrefsbwmdup.supabase.co',
  SERVICE_KEY,
)

const tables = ['candidates', 'companies', 'jobs', 'contacts', 'activity_log', 'team_members']

for (const table of tables) {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS team_id TEXT DEFAULT 'team-alpha'`,
  })
  if (error) {
    console.error(`✗ ${table}: ${error.message}`)
  } else {
    console.log(`✓ ${table}: team_id column added`)
  }
}
