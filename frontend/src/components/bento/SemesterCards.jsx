import { motion } from 'framer-motion'

/**
 * SemesterCards - Grid of semester performance cards
 */
export default function SemesterCards({ results, onSemesterClick }) {
  const getBadgeColor = (sgpa) => {
    if (sgpa >= 9) return 'text-cyan-300 border-cyan-400/60'
    if (sgpa >= 8) return 'text-cyan-400 border-cyan-500/40'
    if (sgpa >= 7) return 'text-slate-200 border-slate-500/60'
    if (sgpa >= 6) return 'text-amber-300 border-amber-500/40'
    return 'text-rose-300 border-rose-500/40'
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {results.map((result) => (
        <motion.div
          key={result.semester}
          variants={item}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.18 }}
          onClick={() => onSemesterClick && onSemesterClick(result)}
          className="group cursor-pointer"
        >
          <div className="h-28 rounded-md border border-[#06b6d4]/35 bg-[#0f172a] group-hover:border-cyan-400 transition-colors">
            <div className="h-full flex flex-col items-start justify-between p-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Semester {result.semester}
              </p>

              <div className="flex items-end justify-between w-full">
                <div className="text-left">
                  <div className="text-2xl font-bold text-cyan-400">
                    {result.sgpa.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{getGradeLabel(result.sgpa)}</p>
                </div>

                <span
                  className={`text-[10px] px-2 py-1 border rounded-sm ${getBadgeColor(result.sgpa)}`}
                >
                  SGPA
                </span>
              </div>

              <div className="w-full h-px bg-[#1e293b]" />

              <p className="text-[10px] text-slate-500">Tap to view details</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
