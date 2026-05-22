import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gbzcirwpjhrefsbwmdup.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiemNpcndwamhyZWZzYndtZHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzQ5MzIsImV4cCI6MjA5NTAxMDkzMn0.k-b2KVfZW-lZ1QMHnCZWRAItMgdQ2KP5cOjteJ6cSJw'

export const supabase = createClient(supabaseUrl, supabaseKey)
