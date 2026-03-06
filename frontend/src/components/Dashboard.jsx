import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { getResults } from '../services/api'

const GRADE_COLOR = (sgpa) => {
  if (sgpa >= 9) return 'text-emerald-600'
  if (sgpa >= 7) return 'text-blue-600'
  if (sgpa >= 5) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Dashboard component.
 * Shows a semester performance line chart and a table of previous results.
 *
 * @param {number} userId  - currently logged-in user's ID
 */
export default function Dashboard({ userId }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getResults(userId)
      .then(setResults)
      .catch((err) => setError(err.message || 'Failed to load results.'))
      .finally(() => setLoading(false))
  }, [userId])

  const chartData = results.map((r) => ({
    semester: `Sem ${r.semester}`,
    SGPA: r.sgpa,
  }))

  const averageSGPA =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.sgpa, 0) / results.length).toFixed(2)
      : null

  if (!userId) {
    return (
      <div className="text-center text-gray-400 py-16">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Please set up your profile to view results.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-indigo-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading results…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 py-8">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Semesters Tracked" value={results.length} />
        <StatCard label="Average SGPA" value={averageSGPA ?? '—'} />
        <StatCard
          label="Latest SGPA"
          value={results.length ? results[results.length - 1].sgpa : '—'}
        />
      </div>

      {/* Line chart */}
      {results.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Semester Performance
          </h2>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                  formatter={(v) => [v, 'SGPA']}
                />
                {averageSGPA && (
                  <ReferenceLine
                    y={parseFloat(averageSGPA)}
                    stroke="#6366f1"
                    strokeDasharray="4 4"
                    label={{ value: 'Avg', position: 'insideTopRight', fontSize: 11, fill: '#6366f1' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="SGPA"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#6366f1' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-12">
          <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No results yet – upload your first result PDF!</p>
        </div>
      )}

      {/* Previous results table */}
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Previous Results
          </h2>
          <div className="overflow-x-auto rounded-2xl shadow-sm">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Semester</th>
                  <th className="px-4 py-3 text-left">SGPA</th>
                  <th className="px-4 py-3 text-left">Credits</th>
                  <th className="px-4 py-3 text-left">Subjects</th>
                  <th className="px-4 py-3 text-left">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">Semester {r.semester}</td>
                    <td className={`px-4 py-3 font-bold ${GRADE_COLOR(r.sgpa)}`}>{r.sgpa}</td>
                    <td className="px-4 py-3">{r.total_credits}</td>
                    <td className="px-4 py-3">{r.subjects.length}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(r.uploaded_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
      <p className="text-2xl font-bold text-indigo-600">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
