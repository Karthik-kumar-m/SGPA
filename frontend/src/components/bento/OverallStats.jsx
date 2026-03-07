import { motion } from 'framer-motion'

/**
 * OverallStats - Large card showing CGPA with circular progress indicator
 */
export default function OverallStats({ cgpa, semestersTracked }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (cgpa / 10) * circumference

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
      <div className="relative h-full flex flex-col items-center justify-center p-8">
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#circleGradient)"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          {/* CGPA text in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-5xl font-bold bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {cgpa}
            </motion.span>
            <span className="text-sm text-gray-400 mt-1">CGPA</span>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center">
          <motion.p
            className="text-gray-400 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {semestersTracked} Semesters Tracked
          </motion.p>
          <motion.p
            className="text-xs text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Cumulative Grade Point Average
          </motion.p>
        </div>

        {/* Grade indicator bar */}
        <motion.div
          className="mt-6 w-32 h-1 bg-white/10 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400"
            style={{ width: `${(cgpa / 10) * 100}%` }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
