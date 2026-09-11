import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

interface PercentGaugesProps {
  matchPercent: number
  changePercent: number
}

function percentColor(value: number): string {
  if (value < 50) return '#ef4444'
  if (value < 85) return '#f59e0b'
  return '#16a34a'
}

function Gauge({ value, label, sub }: { value: number; label: string; sub: string }) {
  const fill = percentColor(value)
  const data = [{ value }]
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            data={data}
            barSize={16}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              dataKey="value"
              angleAxisId={0}
              cornerRadius={10}
              background={{ fill: '#f3f4f6' }}
              fill={fill}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-900">{value.toFixed(1)}%</span>
        </div>
      </div>
      <h4 className="mt-2 font-semibold text-gray-900">{label}</h4>
      <p className="text-xs text-gray-500 text-center mt-1">{sub}</p>
    </div>
  )
}

function PercentGauges({ matchPercent, changePercent }: PercentGaugesProps) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900">Migration Percentages</h3>
      <p className="text-sm text-gray-500 mt-1">
        Match and change ratio gauges
      </p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Gauge
          value={matchPercent}
          label="Match Rate"
          sub="Matched keys vs. records before migration"
        />
        <Gauge
          value={changePercent}
          label="Change Rate"
          sub="Modified records vs. matched keys"
        />
      </div>
    </div>
  )
}

export default PercentGauges