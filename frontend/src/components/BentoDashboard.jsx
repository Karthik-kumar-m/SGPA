import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import OverallStats from './bento/OverallStats'
import TrendChart from './bento/TrendChart'
import UploadZone from './bento/UploadZone'
import SemesterCards from './bento/SemesterCards'
import SemesterDetailModal from './bento/SemesterDetailModal'
import { AlertCircle, Loader2 } from 'lucide-react'
import { getResults } from '../services/api'

/**
 * Bento Grid Dashboard - Main component displaying SGPA Vault dashboard
 */
export default function BentoDashboard({ userId, parsedResult, onResult }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSemester, setSelectedSemester] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch existing results when component mounts or userId changes
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    getResults(userId)
      .then(setResults)
      .catch((err) => setError(err.message || 'Failed to load results.'))
      .finally(() => setLoading(false))
  }, [userId])

  // Add new parsed result to results list
  useEffect(() => {
    if (parsedResult && parsedResult.sgpa) {
      setResults((prev) => [...prev, parsedResult])
    }
  }, [parsedResult])

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester)
    setIsModalOpen(true)
  }

  const sortedResults = [...results].sort((a, b) => Number(a.semester) - Number(b.semester))

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center text-gray-400">
          <p className="text-lg">Please authenticate to view your SGPA dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
          <p className="text-gray-400">Loading your SGPA data…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 text-red-400 py-8 px-4 bg-red-950/20 rounded-lg">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    )
  }

  // Calculate CGPA (average of all semester SGPAs)
  const cgpa = results.length > 0
    ? (results.reduce((sum, r) => sum + r.sgpa, 0) / results.length).toFixed(2)
    : 0

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="px-4 py-8 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-1">
            SGPA Vault
          </h1>
          <p className="text-slate-400 text-sm">Cyber-Flat academic performance tracker</p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-6 gap-4 auto-rows-[280px]"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* 1. Overall CGPA - Large card (top-left) */}
          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <OverallStats cgpa={Number(cgpa)} semestersTracked={sortedResults.length} />
          </motion.div>

          {/* 2. Trend Chart - Wide card (top-right) */}
          <motion.div
            className="xl:col-span-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <TrendChart results={sortedResults} />
          </motion.div>

          {/* 3. Upload Zone - Tactical terminal panel */}
          <motion.div
            className="xl:col-span-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            <UploadZone onResult={onResult} />
          </motion.div>
        </motion.div>

        {/* Semester Cards Grid - Below main bento */}
        {sortedResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="mt-8"
          >
            <h2 className="text-lg font-semibold text-slate-100 mb-4">8-Semester Grid</h2>
            <SemesterCards results={sortedResults} onSemesterClick={handleSemesterClick} />
          </motion.div>
        )}

        {/* Empty state */}
        {results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-slate-400 text-base">
              Upload your first result PDF to get started!
            </p>
          </motion.div>
        )}
      </div>

      {/* Semester Detail Modal */}
      <SemesterDetailModal
        semester={selectedSemester}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
