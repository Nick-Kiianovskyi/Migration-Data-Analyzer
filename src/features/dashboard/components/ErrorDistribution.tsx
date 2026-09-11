import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface ErrorDatum {
  name: string
  value: number
  fill: string
}

interface FieldDatum {
  field: string
  changes: number
}

interface ErrorDistributionProps {
  errorData: ErrorDatum[]
  fieldBreakdown: FieldDatum[]
}

function ErrorDistribution({ errorData, fieldBreakdown }: ErrorDistributionProps) {
  const dataLost = errorData.find((e) => e.name === 'Data Lost')?.value ?? 0

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">Field Change &amp; Error Distribution</h3>
          <p className="text-sm text-gray-500 mt-1">
            How changed values moved between the two versions
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${
            dataLost > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-accent-50 text-accent-700 border border-accent-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${dataLost > 0 ? 'bg-red-500' : 'bg-accent-500'}`} />
          {dataLost > 0 ? `${dataLost.toLocaleString()} values lost` : 'No data loss'}
        </span>
      </div>

      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={errorData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={3}
              strokeWidth={0}
            >
              {errorData.map((entry) => (
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
              formatter={(value, name) => [`${Number(value).toLocaleString()} changes`, String(name)]}
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
      </div>

      {fieldBreakdown.length > 0 && (
        <>
          <h4 className="mt-4 font-semibold text-gray-900 text-sm">Changes by Field</h4>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldBreakdown} layout="vertical" barSize={14} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="field"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 13,
                  }}
                  formatter={(value) => [`${Number(value).toLocaleString()}`, 'Changes']}
                />
                <Bar dataKey="changes" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

export default ErrorDistribution