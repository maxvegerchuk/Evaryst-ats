import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://gbzcirwpjhrefsbwmdup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiemNpcndwamhyZWZzYndtZHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzQ5MzIsImV4cCI6MjA5NTAxMDkzMn0.k-b2KVfZW-lZ1QMHnCZWRAItMgdQ2KP5cOjteJ6cSJw',
)

const TABLES = [
  'activity_log',
  'contacts',
  'candidates',
  'jobs',
  'companies',
  'team_members',
]

async function clearAll() {
  console.log('Clearing all data...\n')
  for (const table of TABLES) {
    const { error, count } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id', { count: 'exact', head: true })

    if (error) {
      console.error(`✗ ${table}: ${error.message}`)
    } else {
      console.log(`✓ ${table}: cleared`)
    }
  }
  console.log('\nDone. Refresh the app to see a clean state.')
}

clearAll()
