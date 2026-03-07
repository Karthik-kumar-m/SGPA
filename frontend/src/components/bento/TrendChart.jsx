import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp } from 'lucide-react'

/**
 * TrendChart - Line chart showing SGPA progression across semesters
 */
export default function TrendChart({ results }) {
  if (!results || results.length === 0) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="h-full rounded-xl border border-[#1e293b] bg-[#0f172a]"
      >
        <div className="h-full flex items-center justify-center">
          <p className="text-slate-400">No data yet</p>
        </div>
      </motion.div>
    )
  }

  const normalizedResults = results
    .map((r) => ({
      semester: r.semester,
      sgpa: Number(r.sgpa),
    }))
    .filter((r) => Number.isFinite(r.sgpa))

  if (normalizedResults.length === 0) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="h-full rounded-xl border border-[#1e293b] bg-[#0f172a]"
      >
        <div className="h-full flex items-center justify-center">
          <p className="text-slate-400">No valid SGPA data to plot</p>
        </div>
      </motion.div>
    )
  }

  const chartData = normalizedResults.map((r) => ({
    semester: `Sem ${r.semester}`,
    SGPA: r.sgpa,
  }))

  const avgSGPA = (
    normalizedResults.reduce((sum, r) => sum + r.sgpa, 0) / normalizedResults.length
  ).toFixed(2)
  const minSGPA = Math.min(...normalizedResults.map((r) => r.sgpa))
  const lowerBound = Number.isFinite(minSGPA) && minSGPA >= 6 ? 6 : Math.max(0, Math.floor(minSGPA - 1))
  const yTicks = lowerBound >= 6 ? [6, 7, 8, 9, 10] : undefined

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full rounded-xl border border-[#1e293b] bg-[#0f172a]"
    >
      <div className="h-full flex flex-col p-5">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-slate-100 font-semibold text-sm">Performance Trend</h3>
            <p className="text-xs text-slate-400">Average SGPA: {avgSGPA}</p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="flex-1 min-h-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="flex justify-end mb-1">
            <span className="text-[10px] px-2 py-1 border border-cyan-500/40 text-cyan-300 bg-cyan-500/10 rounded-sm">
              Avg SGPA: {avgSGPA}
            </span>
          </div>
          <div className="h-[calc(100%-1.75rem)] min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(30, 41, 59, 0.8)" vertical={false} />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: 11, fill: 'rgba(148, 163, 184, 0.85)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[lowerBound, 10]}
                ticks={yTicks}
                tick={{ fontSize: 11, fill: 'rgba(148, 163, 184, 0.85)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value) => [Number(value).toFixed(2), 'SGPA']}
              />
              <ReferenceLine
                y={parseFloat(avgSGPA)}
                stroke="rgba(6, 182, 212, 0.35)"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="SGPA"
                stroke="#06b6d4"
                fill="rgba(6, 182, 212, 0.1)"
                strokeWidth={2.5}
                dot={{
                  fill: '#06b6d4',
                  r: 3,
                  strokeWidth: 2,
                  stroke: '#0f172a',
                }}
                activeDot={{
                  r: 6,
                  fill: '#22d3ee',
                }}
              />
            </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
