import { useEffect, useState } from 'react'
import {
  UserPlus, ArrowRight, FileText, Phone,
  Calendar, Briefcase, Building2, Activity, Clock, Tag,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ActivityRow, ActivityType } from '../../lib/activity'

// ── Icon + color config ───────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ActivityType, {
  Icon:    typeof UserPlus
  iconBg:  string
  iconClr: string
}> = {
  candidate_added:    { Icon: UserPlus,   iconBg: 'bg-[#DBEAFE]', iconClr: 'text-[#1D4ED8]' },
  stage_changed:      { Icon: ArrowRight, iconBg: 'bg-[#F3E8FF]', iconClr: 'text-[#6D28D9]' },
  status_changed:     { Icon: Tag,        iconBg: 'bg-[#F0FDF4]', iconClr: 'text-[#15803D]' },
  note_added:         { Icon: FileText,   iconBg: 'bg-[#F1F5F9]', iconClr: 'text-[#475569]' },
  call_logged:        { Icon: Phone,      iconBg: 'bg-[#DCFCE7]', iconClr: 'text-[#15803D]' },
  meeting_scheduled:  { Icon: Calendar,   iconBg: 'bg-[#FFEDD5]', iconClr: 'text-[#9A3412]' },
  job_created:        { Icon: Briefcase,  iconBg: 'bg-[#EFF6FF]', iconClr: 'text-[#3B82F6]' },
  company_added:      { Icon: Building2,  iconBg: 'bg-[#EEF2FF]', iconClr: 'text-[#3730A3]' },
}

// ── Time-ago helper ───────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)            return 'just now'
  if (diff < 3600)          return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400)         return `${Math.floor(diff / 3600)} hr ago`
  if (diff < 86400 * 2)     return 'yesterday'
  if (diff < 86400 * 7)     return `${Math.floor(diff / 86400)} days ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  teamId: string
}

export function ActivityFeed({ teamId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [loading,    setLoading]    = useState(true)
  const channelName = useState(() => `realtime:activity_feed:${Math.random().toString(36).slice(2)}`)[0]

  useEffect(() => {
    async function fetchActivities() {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(15)
      console.log('activity_log initial fetch:', data, error)
      if (!error && data) setActivities(data as ActivityRow[])
      setLoading(false)
    }

    void fetchActivities()

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        (payload) => {
          console.log('realtime event received:', payload)
          void fetchActivities()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, teamId])

  return (
    <section
      className="bg-white border-subtle rounded-card shadow-sm"
      aria-labelledby="activity-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
        <h2 id="activity-heading" className="flex items-center gap-1.5 text-[15px] font-bold text-text-primary">
          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
          Recent activity
        </h2>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Activity className="w-5 h-5 text-[#CBD5E1] animate-pulse" />
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <Activity className="w-8 h-8 text-[#E2E8F0] mb-2" />
          <p className="text-[12px] text-[#94A3B8]">No recent activity</p>
        </div>
      ) : (
        <ol className="divide-y divide-[#F1F5F9]" aria-label="Recent activity">
          {activities.map((row) => {
            const cfg = TYPE_CONFIG[row.type] ?? TYPE_CONFIG.note_added
            return (
              <li key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                <div
                  className={`w-7 h-7 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}
                  aria-hidden="true"
                >
                  <cfg.Icon className={`w-3.5 h-3.5 ${cfg.iconClr}`} />
                </div>
                <p className="flex-1 min-w-0 text-[12.5px] text-text-primary leading-snug">
                  {row.message}
                </p>
                <span className="shrink-0 text-[11px] text-[#94A3B8] whitespace-nowrap">
                  {timeAgo(row.created_at)}
                </span>
              </li>
            )
          })}
        </ol>
      )}

      {/* Footer */}
      <div className="px-4 py-3" style={{ borderTop: '0.5px solid #F1F5F9' }}>
        <button className="text-[12px] font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">
          See all activity →
        </button>
      </div>
    </section>
  )
}
