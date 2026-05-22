import { UserPlus, PhoneCall } from 'lucide-react'

type Activity = {
  Icon:    typeof UserPlus
  iconBg:  string
  iconClr: string
  content: string
  time:    string
}

const activities: Activity[] = []

export function ActivityFeed() {
  return (
    <section
      className="bg-white border-subtle rounded-card shadow-sm"
      aria-labelledby="activity-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
        <h2 id="activity-heading" className="text-[15px] font-bold text-text-primary">Recent activity</h2>
      </div>

      {/* Activity items — compact single-line */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <PhoneCall className="w-8 h-8 text-[#E2E8F0] mb-2" />
          <p className="text-[12px] text-[#94A3B8]">No recent activity</p>
        </div>
      ) : (
        <ol className="divide-y divide-[#F1F5F9]" aria-label="Recent activity">
          {activities.map((activity, i) => (
            <li key={i} className="flex items-center gap-3 px-6 py-3">
              <div
                className={`w-8 h-8 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0`}
                aria-hidden="true"
              >
                <activity.Icon className={`w-3.5 h-3.5 ${activity.iconClr}`} />
              </div>
              <p className="flex-1 min-w-0 text-[13px] text-text-primary leading-snug truncate">
                {activity.content}
              </p>
              <span className="shrink-0 text-[11px] text-text-muted whitespace-nowrap">
                {activity.time}
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#F1F5F9]">
        <button className="text-[12px] font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">
          See all activity →
        </button>
      </div>
    </section>
  )
}
