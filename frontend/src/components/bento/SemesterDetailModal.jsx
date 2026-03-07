import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * SemesterDetailModal - Popup showing detailed course breakdown for a semester
 */
export default function SemesterDetailModal({ semester, isOpen, onClose }) {
  if (!semester) return null

  const getGradeColor = (sgpa) => {
    if (sgpa >= 9) return 'emerald'
    if (sgpa >= 8) return 'blue'
    if (sgpa >= 7) return 'indigo'
    if (sgpa >= 6) return 'yellow'
    return 'orange'
  }

  const colorClass = getGradeColor(semester.sgpa)
  const colors = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    indigo: 'from-indigo-500 to-blue-500',
    yellow: 'from-yellow-500 to-amber-500',
    orange: 'from-orange-500 to-red-500',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 z-50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Header with gradient accent */}
              <div className={`bg-gradient-to-r ${colors[colorClass]} p-6 relative`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Semester {semester.semester}</h2>
                    <p className="text-white/80 mt-1">Performance Details</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* SGPA Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase mb-1">SGPA</p>
                    <p className={`text-2xl font-bold bg-gradient-to-r ${colors[colorClass]} bg-clip-text text-transparent`}>
                      {semester.sgpa.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase mb-1">Total Credits</p>
                    <p className="text-2xl font-bold text-gray-100">{semester.total_credits}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase mb-1">Graded Credits</p>
                    <p className="text-2xl font-bold text-gray-100">{semester.graded_credits}</p>
                  </div>
                </div>

                {/* Courses Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">Courses</h3>
                  <div className="space-y-2">
                    {semester.courses && semester.courses.length > 0 ? (
                      semester.courses.map((course, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-100">{course.code}</p>
                              <p className="text-sm text-gray-400 mt-1">{course.title}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-semibold text-gray-300">
                                {course.is_non_credit ? '—' : course.grade || '—'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {course.credits} Credit{course.credits !== 1 ? 's' : ''}
                              </p>
                              {course.is_non_credit && (
                                <p className="text-xs text-cyan-400 mt-1 font-semibold">
                                  Completed
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No courses found for this semester.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white/5 border-t border-white/10 p-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-100 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
