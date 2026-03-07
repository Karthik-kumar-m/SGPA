import { motion } from 'framer-motion'

/**
 * SemesterCards - Grid of semester performance cards
 */
export default function SemesterCards({ results, onSemesterClick }) {
  const getGradeColor = (sgpa) => {
    if (sgpa >= 9) return 'from-emerald-500 to-teal-500'
    if (sgpa >= 8) return 'from-blue-500 to-cyan-500'
    if (sgpa >= 7) return 'from-indigo-500 to-blue-500'
    if (sgpa >= 6) return 'from-yellow-500 to-amber-500'
    return 'from-orange-500 to-red-500'
  }

  const getGradeLabel = (sgpa) => {
    if (sgpa >= 9) return 'Outstanding'
    if (sgpa >= 8) return 'Excellent'
    if (sgpa >= 7) return 'Very Good'
    if (sgpa >= 6) return 'Good'
    return 'Average'
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {results.map((result) => (
        <motion.div
          key={result.semester}
          variants={item}
          whileHover={{ y: -8, scale: 1.05 }}
          onClick={() => onSemesterClick && onSemesterClick(result)}
          className="group cursor-pointer"
        >
          <div className="relative h-32 rounded-xl overflow-hidden">
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 group-hover:border-white/40 transition-all" />

            {/* Gradient accent */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getGradeColor(
                result.sgpa,
              )} opacity-0 group-hover:opacity-10 transition-all duration-300`}
            />

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-cyan-600/0 group-hover:from-indigo-600/5 group-hover:via-cyan-600/5 group-hover:to-indigo-600/5 transition-all duration-300" />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
              {/* Semester label */}
              <motion.p
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                whileHover={{ color: '#e0e7ff' }}
              >
                Sem {result.semester}
              </motion.p>

              {/* SGPA value */}
              <motion.div
                className={`text-3xl font-bold bg-gradient-to-r ${getGradeColor(
                  result.sgpa,
                )} bg-clip-text text-transparent mt-1`}
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                {result.sgpa.toFixed(2)}
              </motion.div>

              {/* Grade label */}
              <motion.p
                className="text-xs text-gray-500 mt-1"
                whileHover={{ color: '#d1d5db' }}
              >
                {getGradeLabel(result.sgpa)}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
