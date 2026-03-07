import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck, X } from 'lucide-react'

const GRADE_POINTS = {
  O: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
}

const AUDIT_PREFIXES = ['BNSK', 'BPEK', 'BYOK', 'BIKS']

function isAuditCode(code = '') {
  return AUDIT_PREFIXES.some((prefix) => code.startsWith(prefix))
}

function resolveCredits(code = '', fallbackCredits = 0) {
  if (code === 'BCS803') return 10
  if (code === 'BCS786') return 6
  if (isAuditCode(code)) return 0

  if (/^BMATS\d01$/.test(code)) return 4
  if (/^BPHYS\d02$/.test(code)) return 4
  if (/^BCS\d02$/.test(code)) return 4
  if (/^BCS\d03$/.test(code)) return 4
  if (code === 'BCS701') return 4

  if (/^BCS\d04$/.test(code)) return 3
  if (code === 'BCS401') return 3
  if (/^B[A-Z]{2}\d{3}[A-Z]?$/.test(code) && /6\d{2}/.test(code)) return 3

  return Number(fallbackCredits || 0)
}

function normalizeSemester(semester) {
  const sourceCourses = semester?.courses || semester?.subjects || []

  const courses = sourceCourses.map((course) => {
    const code = String(course.code || course.subject_code || '').trim().toUpperCase()
    const grade = String(course.grade || course.grade_letter || '').trim().toUpperCase()
    const credits = resolveCredits(code, course.credits)
    const isAudit = isAuditCode(code) || course.is_non_credit === true
    const effectiveCredits = isAudit ? 0 : credits
    const points = Number(course.grade_points ?? GRADE_POINTS[grade] ?? 0)

    return {
      ...course,
      code,
      title: course.title || course.subject_name || 'Untitled Course',
      grade,
      credits: effectiveCredits,
      is_non_credit: isAudit,
      grade_points: points,
      weighted_points: points * effectiveCredits,
    }
  })

  const gradedCredits = courses.reduce((sum, course) => sum + (course.is_non_credit ? 0 : course.credits), 0)
  const totalCredits = courses.reduce((sum, course) => sum + (course.is_non_credit ? 0 : course.credits), 0)
  const weightedTotal = courses.reduce((sum, course) => sum + course.weighted_points, 0)
  const fallbackSGPA = Number(semester?.sgpa || 0)
  const apiTotalCredits = Number(semester?.total_credits || 0)
  const apiGradedCredits = Number(semester?.graded_credits || 0)

  return {
    ...semester,
    courses,
    total_credits: totalCredits > 0 ? totalCredits : apiTotalCredits,
    graded_credits: gradedCredits > 0 ? gradedCredits : apiGradedCredits,
    computed_sgpa: gradedCredits > 0 ? weightedTotal / gradedCredits : fallbackSGPA,
  }
}

/**
 * SemesterDetailModal - Cyber-flat modal with VTU credit and grade normalization
 */
export default function SemesterDetailModal({ semester, isOpen, onClose }) {
  const normalizedSemester = semester ? normalizeSemester(semester) : null

  if (!normalizedSemester) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="w-[95%] max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-[#0f172a] border border-[#06b6d4] rounded-md shadow-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1e293b] flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-400 mb-1">
                    Semester {normalizedSemester.semester}
                  </p>
                  <h2 className="text-slate-100 text-xl font-semibold">Detailed Breakdown</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-200 border border-[#1e293b] rounded-sm"
                  aria-label="Close semester details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 max-h-[72vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <div className="border border-[#1e293b] bg-[#020617] rounded-sm p-3">
                    <p className="text-[11px] text-slate-500 uppercase">SGPA</p>
                    <p className="text-2xl font-bold text-cyan-400">{normalizedSemester.computed_sgpa.toFixed(2)}</p>
                  </div>
                  <div className="border border-[#1e293b] bg-[#020617] rounded-sm p-3">
                    <p className="text-[11px] text-slate-500 uppercase">Total Credits</p>
                    <p className="text-2xl font-bold text-slate-200">{normalizedSemester.total_credits}</p>
                  </div>
                  <div className="border border-[#1e293b] bg-[#020617] rounded-sm p-3">
                    <p className="text-[11px] text-slate-500 uppercase">Graded Credits</p>
                    <p className="text-2xl font-bold text-slate-200">{normalizedSemester.graded_credits}</p>
                  </div>
                </div>

                <div className="border border-[#1e293b] rounded-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#1e293b] bg-[#020617] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200">Courses</h3>
                    <div className="flex items-center gap-1 text-[11px] text-cyan-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Rules Applied</span>
                    </div>
                  </div>

                  <div className="divide-y divide-[#1e293b]">
                    {normalizedSemester.courses.length > 0 ? (
                      normalizedSemester.courses.map((course, idx) => (
                        <motion.div
                          key={`${course.code}-${idx}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18, delay: idx * 0.02 }}
                          className="px-4 py-3 bg-[#0f172a]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm text-cyan-300 font-semibold font-jetbrains-mono">
                                {course.code || 'N/A'}
                              </p>
                              <p className="text-sm text-slate-300 mt-0.5 break-words">{course.title}</p>
                            </div>

                            <div className="text-right shrink-0">
                              {course.is_non_credit ? (
                                <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold justify-end">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Completed
                                </div>
                              ) : (
                                <p className="text-sm text-slate-200 font-semibold">{course.grade || '-'}</p>
                              )}
                              <p className="text-xs text-slate-500 mt-0.5">
                                {course.credits} Credit{course.credits === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="px-4 py-5 text-sm text-slate-500">No courses available for this semester.</p>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
