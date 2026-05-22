import { ChevronRight } from 'lucide-react'

const stages = [
  { label: 'New',       count: 18 },
  { label: 'Phone',     count: 14 },
  { label: 'Interview', count: 8  },
  { label: 'Refs',      count: 4  },
  { label: 'Submitted', count: 2  },
]

export function PipelineCard() {
  return (
    <section
      className="bg-white border-subtle rounded-card shadow-sm h-full flex flex-col"
      aria-labelledby="pipeline-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
        <h2 id="pipeline-heading" className="text-[15px] font-bold text-text-primary">
          Pipeline
        </h2>
        <button className="text-[12px] font-semibold text-[#2563EB] hover:text-blue-700 transition-colors whitespace-nowrap">
          View kanban →
        </button>
      </div>

      {/* Compact horizontal stages */}
      <div className="flex-1 px-6 py-5 flex items-center">
        <div
          className="w-full flex items-center justify-between rounded-[10px] bg-[#EFF6FF] px-4 py-4"
          role="list"
          aria-label="Pipeline stages"
        >
          {stages.map((stage, i) => (
            <div key={stage.label} className="flex items-center" role="listitem">
              {/* Stage */}
              <div className="flex flex-col items-center gap-1 min-w-[52px]">
                <span className="text-[20px] font-bold text-text-primary tabular-nums leading-none">
                  {stage.count}
                </span>
                <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">
                  {stage.label}
                </span>
              </div>

              {/* Arrow between stages */}
              {i < stages.length - 1 && (
                <ChevronRight
                  className="w-4 h-4 text-blue-300 mx-3 shrink-0"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
