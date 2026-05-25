// ── Data ──────────────────────────────────────────────────────────────────────

interface JobRow {
  client:   string
  position: string
  d: number
  s: number
  i: number
  a: number
}

const MY_JOBS: JobRow[] = [
  { client: 'MedStar',  position: 'RN Staff Nurse',   d: 14, s:  8, i: 3, a: 2 },
  { client: 'Tyco',     position: 'Sales Manager',    d:  7, s: 12, i: 5, a: 4 },
  { client: 'Senderra', position: 'Pharmacist',       d: 21, s:  4, i: 1, a: 1 },
  { client: 'Glazers',  position: 'Helpdesk',         d: 30, s:  8, i: 2, a: 1 },
  { client: 'Pepsico',  position: 'Business Analyst', d: 45, s:  3, i: 1, a: 0 },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function MyJobsCard() {
  return (
    <section
      className="bg-white border-subtle rounded-[10px] shadow-sm flex flex-col"
      aria-labelledby="my-jobs-heading"
    >
      <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
        <h2 id="my-jobs-heading" className="text-[15px] font-bold text-text-primary">My Jobs</h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F1F5F9]">
            <th scope="col" className="text-left px-4 py-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">
              Client
            </th>
            <th scope="col" className="text-right px-3 py-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wide" title="Days open">D</th>
            <th scope="col" className="text-right px-3 py-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wide" title="Submissions">S</th>
            <th scope="col" className="text-right px-3 py-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wide" title="Interviews">I</th>
            <th scope="col" className="text-right px-4 py-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-wide" title="Active candidates">A</th>
          </tr>
        </thead>
        <tbody>
          {MY_JOBS.map(job => (
            <tr
              key={job.client}
              className="border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50 transition-colors cursor-default"
            >
              <td className="px-4 py-2.5">
                <p className="text-[12px] font-medium text-[#1E293B]">{job.client}</p>
                <p className="text-[10px] text-[#64748B]">{job.position}</p>
              </td>
              <td className="text-right px-3 py-2.5 text-[12px] text-[#64748B] tabular-nums">{job.d}</td>
              <td className="text-right px-3 py-2.5 text-[12px] text-[#64748B] tabular-nums">{job.s}</td>
              <td className="text-right px-3 py-2.5 text-[12px] text-[#64748B] tabular-nums">{job.i}</td>
              <td className="text-right px-4 py-2.5 text-[12px] text-[#64748B] tabular-nums">{job.a}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
