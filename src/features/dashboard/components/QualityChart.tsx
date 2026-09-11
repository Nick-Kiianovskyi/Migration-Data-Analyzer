import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface QualityDatum {
  name: string
  value: number
  fill: string
}

interface QualityChartProps {
  data: QualityDatum[]
  matched: number
}

function QualityChart({ data, matched }: QualityChartProps) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900">Migration Quality</h3>
      <p className="text-sm text-gray-500 mt-1">
        Share of records by migration outcome
      </p>
      <div className="relative h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: 13,
              }}
              formatter={(value, name) => [`${Number(value).toLocaleString()} records`, String(name)]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-900">{matched.toLocaleString()}</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Matched Keys
          </span>
        </div>
      </div>
    </div>
  )
}

export default QualityChart