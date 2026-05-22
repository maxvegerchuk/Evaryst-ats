import { useState } from 'react'
import { Phone, Video, MoreHorizontal, Calendar, Plus } from 'lucide-react'

interface ScheduleItem {
  id:          number
  name:        string
  company:     string
  type:        'phone' | 'video'
  time:        string
  status:      string
  statusColor: 'amber' | 'blue' | 'green' | 'purple' | 'indigo'
}

const STATUS_CLS: Record<ScheduleItem['statusColor'], string> = {
  amber:  'bg-amber-50  text-amber-700  border border-amber-200',
  blue:   'bg-blue-50   text-blue-700   border border-blue-200',
  green:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
}

const todayItems: ScheduleItem[] = [
  { id: 1, name: 'John Scott',   company: 'Elemental Dynamics', type: 'phone', time: 'in 30m',   status: 'Negotiation',  statusColor: 'amber'  },
  { id: 2, name: 'Ava Foster',   company: 'ZenithCraft',        type: 'video', time: '10:30 AM', status: 'Interview',    statusColor: 'blue'   },
  { id: 3, name: 'Mason Harper', company: 'Elemental Dynamics', type: 'video', time: '2:00 PM',  status: 'Qualified',    statusColor: 'green'  },
  { id: 4, name: 'Omar Mango',   company: 'HealthSync',         type: 'video', time: '3:00 PM',  status: 'Phone Screen', statusColor: 'purple' },
  { id: 5, name: 'Sarah Kim',    company: 'ABC Company',        type: 'phone', time: '4:30 PM',  status: 'References',   statusColor: 'indigo' },
]

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

interface ScheduleTableProps {
  selectedDate: Date
}

export function ScheduleTable({ selectedDate }: ScheduleTableProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = isSameDay(selectedDate, today)
  const items   = isToday ? todayItems : []
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
  const title   = isToday ? "Today's schedule" : `${dayName}'s schedule`

  const toggle = (id: number) =>
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <section
      className="bg-white border-subtle rounded-card shadow-sm"
      aria-labelledby="schedule-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
        <h2 id="schedule-heading" className="text-[15px] font-bold text-text-primary">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-[12px] font-semibold text-text-secondary border border-border-default px-3 py-1.5 rounded-btn hover:bg-slate-50 transition-colors">
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Add
          </button>
          <button className="text-[12px] font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">
            View all →
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <Calendar className="w-12 h-12 text-text-muted opacity-30" aria-hidden="true" />
          <p className="text-[14px] font-medium text-text-secondary">No calls scheduled</p>
          <button className="text-[12px] font-semibold text-[#2563EB] hover:underline">
            Add a call →
          </button>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="w-10 px-4 py-2.5" aria-hidden="true" />
                {(['Name', 'Company', 'Type', 'Time', 'Status'] as const).map(col => (
                  <th
                    key={col}
                    scope="col"
                    className="text-left px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.08em] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
                <th className="w-10 px-4 py-2.5" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const done = checked.has(item.id)
                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors group"
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(item.id)}
                        role="checkbox"
                        aria-checked={done}
                        aria-label={`Mark ${item.name} as done`}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                          done
                            ? 'bg-[#2563EB] border-[#2563EB]'
                            : 'border-border-strong hover:border-[#2563EB]'
                        }`}
                      >
                        {done && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-medium cursor-pointer transition-colors ${
                        done ? 'line-through text-text-muted' : 'text-text-primary hover:text-[#2563EB]'
                      }`}>
                        {item.name}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3 text-[13px] text-text-secondary">
                      {item.company}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      {item.type === 'phone'
                        ? <Phone className="w-4 h-4 text-text-muted" aria-label="Phone call" />
                        : <Video className="w-4 h-4 text-text-muted" aria-label="Video call" />
                      }
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-[13px] text-text-secondary whitespace-nowrap">
                      {item.time}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_CLS[item.statusColor]}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4 text-text-muted" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
