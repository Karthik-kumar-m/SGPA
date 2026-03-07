import { motion } from 'framer-motion'
import { Award, Briefcase } from 'lucide-react'

/**
 * InternshipCard - Highlights final year internship/project semester
 */
export default function InternshipCard({ results }) {
  // Find the last semester (typically internship/project semester)
  const lastSemester = results[results.length - 1]
  
  if (!lastSemester) return null

  const creditData = lastSemester.credits || 24 // Typically Sem 7-8 have 20-24 credits
  const courseCount = lastSemester.courses?.length || 0

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="relative h-full rounded-2xl overflow-hidden group"
    >
      {/* Glass background with premium effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/30 group-hover:border-white/50 transition-all shadow-xl" />

      {/* Premium glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-yellow-600/0 to-amber-600/0 group-hover:from-amber-600/20 group-hover:via-yellow-600/20 group-hover:to-amber-600/20 transition-all duration-300" />

      {/* Animated border effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-200/30 via-yellow-200/10 to-amber-200/30 blur-xl" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col p-6">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-amber-400/20 to-yellow-400/20 border border-amber-400/30"
          >
            <Briefcase className="w-5 h-5 text-amber-300" />
          </motion.div>
          <div>
            <h3 className="text-white font-bold text-sm">Final Year</h3>
            <p className="text-xs text-amber-300">Major Project & Internship</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="flex-1 flex flex-col justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* SGPA - Large */}
          <div className="text-center py-2">
            <motion.span
              className="block text-4xl font-bold bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {lastSemester.sgpa.toFixed(2)}
            </motion.span>
            <p className="text-xs text-gray-400 mt-1">Semester SGPA</p>
          </div>

          {/* Credits and Courses */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="text-center p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-amber-400/30 transition-colors"
              whileHover={{ scale: 1.05, borderColor: 'rgba(251, 191, 36, 0.3)' }}
            >
              <p className="text-lg font-bold text-amber-300">{creditData}</p>
              <p className="text-xs text-gray-400 mt-1">Credits</p>
            </motion.div>
            <motion.div
              className="text-center p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-amber-400/30 transition-colors"
              whileHover={{ scale: 1.05, borderColor: 'rgba(251, 191, 36, 0.3)' }}
            >
              <p className="text-lg font-bold text-yellow-300">{courseCount}</p>
              <p className="text-xs text-gray-400 mt-1">Courses</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Achievement indicator */}
        <motion.div
          className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <p className="text-xs text-gray-400">
            Sem {lastSemester.semester} {lastSemester.sgpa >= 8 ? '✓ Excellent Performance' : '✓ Completed'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
