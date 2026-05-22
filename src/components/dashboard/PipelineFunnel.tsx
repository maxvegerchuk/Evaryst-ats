export type PipelineStage = {
  id: string
  label: string
  count: number
  trend?: { value: number; period: string }
  context?: string
}

const countSizeByIndex = ['text-4xl', 'text-3xl', 'text-2xl'] as const

export function PipelineFunnel({ stages }: { stages: PipelineStage[] }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-0"
      role="list"
      aria-label="Pipeline stages"
    >
      {stages.map((stage, i) => (
        <div key={stage.id} className="flex items-start" role="listitem">
          {i > 0 && (
            <div
              className="hidden sm:flex items-center self-stretch px-5 pb-6 text-border-strong select-none"
              aria-hidden="true"
            >
              <span className="text-lg leading-none mt-1">→</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span
              className={`font-semibold text-text-primary leading-none tabular-nums ${countSizeByIndex[i] ?? 'text-xl'}`}
            >
              {stage.count.toLocaleString()}
            </span>
            <span className="text-sm text-text-secondary mt-1">{stage.label}</span>
            {stage.trend ? (
              <span
                className={`text-xs font-medium ${
                  stage.trend.value >= 0 ? 'text-status-success' : 'text-status-danger'
                }`}
                aria-label={`${stage.trend.value >= 0 ? 'Up' : 'Down'} ${Math.abs(stage.trend.value)} percent ${stage.trend.period}`}
              >
                {stage.trend.value >= 0 ? '+' : ''}{stage.trend.value}% {stage.trend.period}
              </span>
            ) : stage.context ? (
              <span className="text-xs text-text-muted">{stage.context}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
