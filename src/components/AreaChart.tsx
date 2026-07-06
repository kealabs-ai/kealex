interface AreaChartProps {
  data: Array<{ label: string; receita: number; despesa: number }>
  height?: number
  isDark?: boolean
}

export function AreaChart({ data, height = 300, isDark }: AreaChartProps) {
  if (!data || data.length === 0) return null

  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const width = 800
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxValue = Math.max(...data.flatMap((d) => [d.receita, d.despesa]))
  const minValue = 0

  const xStep = chartWidth / (data.length - 1 || 1)
  const yScale = (chartHeight) / (maxValue - minValue || 1)

  // Gerar pontos para receita
  const receitaPoints = data
    .map((d, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + chartHeight - (d.receita - minValue) * yScale,
    }))

  // Gerar pontos para despesa
  const despesaPoints = data
    .map((d, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + chartHeight - (d.despesa - minValue) * yScale,
    }))

  // Criar path para receita (curva suave)
  const receitaPath = receitaPoints
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = receitaPoints[i - 1]
      const cp1x = prev.x + (p.x - prev.x) / 3
      const cp1y = prev.y
      const cp2x = p.x - (p.x - prev.x) / 3
      const cp2y = p.y
      return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`
    })
    .join(' ')

  // Criar path para despesa (linha pontilhada)
  const despesaPath = despesaPoints
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = despesaPoints[i - 1]
      return `L ${p.x} ${p.y}`
    })
    .join(' ')

  // Fechar área para receita
  const receitaAreaPath =
    receitaPath +
    ` L ${receitaPoints[receitaPoints.length - 1].x} ${padding.top + chartHeight}` +
    ` L ${receitaPoints[0].x} ${padding.top + chartHeight} Z`

  const bgColor = isDark ? '#1e1b4b' : '#f8faff'
  const gridColor = isDark ? '#312e81' : '#e5e7eb'
  const textColor = isDark ? '#cbd5e1' : '#6b7280'

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Background */}
      <rect width={width} height={height} fill={bgColor} />

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding.top + chartHeight * (1 - ratio)
        const value = Math.round(minValue + (maxValue - minValue) * ratio)
        return (
          <g key={`grid-${ratio}`}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={gridColor} strokeWidth="1" opacity="0.3" />
            <text x={padding.left - 10} y={y + 4} fontSize="11" fill={textColor} textAnchor="end">
              R$ {(value / 1000).toFixed(0)}k
            </text>
          </g>
        )
      })}

      {/* Receita area */}
      <defs>
        <linearGradient id="receitaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={receitaAreaPath} fill="url(#receitaGradient)" />
      <path d={receitaPath} stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Despesa line (dashed) */}
      <path d={despesaPath} stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="5,5" strokeLinecap="round" strokeLinejoin="round" />

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={`label-${i}`}
          x={padding.left + i * xStep}
          y={height - padding.bottom + 20}
          fontSize="11"
          fill={textColor}
          textAnchor="middle"
        >
          {d.label}
        </text>
      ))}

      {/* Legend */}
      <g>
        <rect x={width - 180} y={10} width="170" height="60" fill={isDark ? '#0f172a' : '#ffffff'} stroke={gridColor} strokeWidth="1" rx="8" />
        <circle cx={width - 160} cy={25} r="3" fill="#10b981" />
        <text x={width - 150} y={29} fontSize="12" fill={textColor} fontWeight="500">
          Receitas
        </text>
        <circle cx={width - 160} cy={45} r="3" fill="#ef4444" />
        <text x={width - 150} y={49} fontSize="12" fill={textColor} fontWeight="500">
          Despesas
        </text>
      </g>
    </svg>
  )
}
