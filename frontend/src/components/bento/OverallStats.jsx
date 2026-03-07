import { motion } from 'framer-motion'

/**
 * OverallStats - Large card showing CGPA with circular progress indicator
 */
export default function OverallStats({ cgpa, semestersTracked }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (cgpa / 10) * circumference

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full rounded-xl border border-[#1e293b] bg-[#0f172a] overflow-hidden"
    >
      <div className="h-full flex flex-col items-center px-6 pt-4 pb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-3">CGPA Readout</p>

        {/* Circular Progress */}
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(30, 41, 59, 1)"
              strokeWidth="3"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-cyan-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {cgpa}
            </motion.span>
            <span className="text-xs text-slate-400 mt-1">/ 10.00</span>
          </div>
        </div>

        <div className="text-center mt-1">
          <p className="text-slate-300 text-sm font-medium">
            {semestersTracked} Semesters Tracked
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Cumulative Grade Point Average
          </p>
        </div>

        <div className="mt-4 w-32 h-1 bg-[#1e293b] overflow-hidden rounded-sm">
          <div
            className="h-full bg-cyan-500"
            style={{ width: `${(cgpa / 10) * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}
