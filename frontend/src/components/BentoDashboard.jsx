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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Indigo blob */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Cyan blob */}
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-8 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
            SGPA Vault
          </h1>
          <p className="text-gray-400 text-lg">Your complete semester performance tracker</p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[300px] lg:auto-rows-[280px]"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* 1. Overall CGPA - Large card (top-left) */}
          <motion.div
            className="lg:col-span-5 lg:row-span-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <OverallStats cgpa={cgpa} semestersTracked={results.length} />
          </motion.div>

          {/* 2. Trend Chart - Wide card (top-right) */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TrendChart results={results} />
          </motion.div>

          {/* 3. Upload Zone - Center wide card */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <UploadZone onResult={onResult} />
          </motion.div>
        </motion.div>

        {/* Semester Cards Grid - Below main bento */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Semester Breakdown</h2>
            <SemesterCards results={results} onSemesterClick={handleSemesterClick} />
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
            <p className="text-gray-400 text-lg">
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
