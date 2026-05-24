import { supabase } from './supabase'

export type ActivityType =
  | 'candidate_added'
  | 'stage_changed'
  | 'status_changed'
  | 'note_added'
  | 'call_logged'
  | 'meeting_scheduled'
  | 'job_created'
  | 'company_added'

export interface ActivityRow {
  id:          string
  created_at:  string
  type:        ActivityType
  message:     string
  entity_id:   string | null
  entity_type: string | null
  user_id:     string | null
}

export async function logActivity(
  type:        ActivityType,
  message:     string,
  entityId?:   string,
  entityType?: string,
  userId?:     string,
): Promise<void> {
  console.log('logActivity called:', type, message)
  const { data, error } = await supabase.from('activity_log').insert({
    type,
    message,
    entity_id:   entityId   ?? null,
    entity_type: entityType ?? null,
    user_id:     userId     ?? null,
  }).select()
  console.log('activity insert result:', data, error)
  if (error) console.error('logActivity error:', error)
}
