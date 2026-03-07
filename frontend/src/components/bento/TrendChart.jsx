import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp } from 'lucide-react'

/**
 * TrendChart - Line chart showing SGPA progression across semesters
 */
export default function TrendChart({ results }) {
  if (!results || results.length === 0) {
    return (
      <motion.div
        whileHover={{ y: -10 }}
        className="relative h-full rounded-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20" />
        <div className="relative h-full flex items-center justify-center">
          <p className="text-gray-400">No data yet</p>
        </div>
      </motion.div>
    )
  }

  const chartData = results.map((r) => ({
    semester: `Sem ${r.semester}`,
    SGPA: r.sgpa,
  }))

  const avgSGPA = (results.reduce((sum, r) => sum + r.sgpa, 0) / results.length).toFixed(2)

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="relative h-full rounded-2xl overflow-hidden group"
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 group-hover:border-white/40 transition-colors" />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-cyan-600/0 group-hover:from-indigo-600/10 group-hover:via-cyan-600/10 group-hover:to-indigo-600/10 transition-all duration-300" />

      {/* Content */}
      <div className="relative h-full flex flex-col p-6">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-white font-semibold text-sm">Performance Trend</h3>
            <p className="text-xs text-gray-400">Average SGPA: {avgSGPA}</p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: 11, fill: 'rgba(156, 163, 175, 0.8)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 11, fill: 'rgba(156, 163, 175, 0.8)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#e0e7ff' }}
                formatter={(value) => [value.toFixed(2), 'SGPA']}
              />
              <ReferenceLine
                y={parseInt(avgSGPA)}
                stroke="rgba(129, 140, 248, 0.3)"
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${avgSGPA}`,
                  fill: 'rgba(156, 163, 175, 0.8)',
                  fontSize: 10,
                  offset: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="SGPA"
                stroke="url(#trendGradient)"
                strokeWidth={3}
                dot={{
                  fill: 'rgba(129, 140, 248, 0.8)',
                  r: 4,
                  strokeWidth: 2,
                  stroke: 'rgba(15, 23, 42, 1)',
                }}
                activeDot={{
                  r: 6,
                  fill: 'rgba(129, 140, 248, 1)',
                }}
              />
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  )
}
