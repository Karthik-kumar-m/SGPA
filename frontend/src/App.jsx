import { useState, useEffect } from 'react'
import { GraduationCap, LayoutDashboard, Upload as UploadIcon, Save, AlertCircle, CheckCircle, LogOut, X } from 'lucide-react'
import FileUpload from './components/FileUpload'
import BentoDashboard from './components/BentoDashboard'
import Auth from './components/Auth'
import { saveResult } from './services/api'
import { motion } from 'framer-motion'

const TABS = ['Upload', 'Dashboard']

export default function App() {
  const [activeTab, setActiveTab] = useState('Upload')
  const [user, setUser] = useState(null)   // { id, name, usn }
  const [parsedResult, setParsedResult] = useState(null)
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' })

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('Invalid stored user data')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  // -------------------------------------------------------------------------
  // Auth handlers
  // -------------------------------------------------------------------------
  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setParsedResult(null)
    setSaveStatus({ type: '', message: '' })
  }

  // -------------------------------------------------------------------------
  // Save result after upload
  // -------------------------------------------------------------------------
  const handleSaveResult = async (e) => {
    e.preventDefault()
    if (!parsedResult || !user) return
    setSaveStatus({ type: '', message: '' })
    try {
      await saveResult({
        user_id: user.id,
        semester: parsedResult.semester,  // Automatically detected from PDF
        sgpa: parsedResult.sgpa,
        total_credits: parsedResult.total_credits,
        subjects: parsedResult.subjects,
      })
      setSaveStatus({ type: 'success', message: 'Result saved successfully!' })
      setParsedResult(null)
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message })
    }
  }

  return (
    <>
      {/* Show Auth component if not logged in */}
      {!user && <Auth onAuthSuccess={handleAuthSuccess} />}

      {/* Main app - only show if logged in */}
      {user && (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {/* Header */}
          <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
            <div className="px-4 py-4 lg:px-8 flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30">
                  <GraduationCap className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                    SGPA Vault
                  </h1>
                  <p className="text-xs text-gray-500">Semester Performance Tracker</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="hidden sm:flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium text-sm">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.usn}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </motion.div>
            </div>
          </header>

          <main className="relative z-10">
            {/* Two-pane layout on larger screens: Dashboard + Upload Modal */}
            {activeTab === 'Dashboard' ? (
              <BentoDashboard 
                userId={user?.id} 
                parsedResult={parsedResult}
                onResult={setParsedResult}
              />
            ) : (
              /* Upload modal/overlay */
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl"
                >
                  {/* Modal header */}
                  <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/50 backdrop-blur">
                    <h2 className="text-2xl font-bold text-white">Upload Result PDF</h2>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('Dashboard')}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  </div>

                  {/* Modal content */}
                  <div className="p-8 space-y-6">
                    <FileUpload onResult={setParsedResult} />

                    {/* Parsed result preview */}
                    {parsedResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-indigo-500/30 rounded-2xl p-6 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-white text-lg">Parsed Result</h3>
                          <motion.span
                            className="text-4xl font-bold bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-transparent"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                          >
                            {parsedResult.sgpa}
                          </motion.span>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                          Semester: <span className="text-indigo-300 font-semibold">{parsedResult.semester}</span> • 
                          Total Credits: <span className="text-cyan-300 font-semibold">{parsedResult.total_credits}</span>
                        </p>

                        {/* Subjects table */}
                        <div className="overflow-x-auto rounded-xl mb-6 border border-white/10">
                          <table className="w-full text-xs">
                            <thead className="bg-white/10 border-b border-white/10">
                              <tr>
                                <th className="px-4 py-3 text-left text-gray-300 font-semibold">Code</th>
                                <th className="px-4 py-3 text-left text-gray-300 font-semibold">Credits</th>
                                <th className="px-4 py-3 text-left text-gray-300 font-semibold">Grade</th>
                                <th className="px-4 py-3 text-left text-gray-300 font-semibold">Points</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {parsedResult.subjects.map((s) => (
                                <tr key={s.subject_code} className="hover:bg-white/5 transition">
                                  <td className="px-4 py-3 font-code text-gray-300">{s.subject_code}</td>
                                  <td className="px-4 py-3 text-gray-400">{s.credits}</td>
                                  <td className="px-4 py-3 font-bold text-indigo-300">{s.grade}</td>
                                  <td className="px-4 py-3 text-cyan-300">{s.grade_points}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Save button */}
                        <motion.form 
                          onSubmit={handleSaveResult}
                          className="flex gap-3"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/50"
                          >
                            <Save className="w-5 h-5" />
                            Save Result
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setActiveTab('Dashboard')}
                            className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:border-white/40 hover:text-white transition-all"
                          >
                            Later
                          </motion.button>
                        </motion.form>

                        {/* Status message */}
                        {saveStatus.message && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-2 mt-4 p-3 rounded-lg text-sm ${
                              saveStatus.type === 'error'
                                ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                                : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                            }`}
                          >
                            {saveStatus.type === 'error' ? (
                              <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            )}
                            {saveStatus.message}
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Back to dashboard note */}
                    {!parsedResult && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-gray-400 text-center mt-8"
                      >
                        After uploading, your result will be parsed and displayed here.
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </main>

          {/* Floating action button to toggle between views */}
          {user && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(activeTab === 'Dashboard' ? 'Upload' : 'Dashboard')}
              className="fixed bottom-8 right-8 z-40 p-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg hover:shadow-indigo-500/50 transition-all lg:hidden"
              title={activeTab === 'Dashboard' ? 'Upload' : 'Dashboard'}
            >
              {activeTab === 'Dashboard' ? (
                <UploadIcon className="w-6 h-6" />
              ) : (
                <LayoutDashboard className="w-6 h-6" />
              )}
            </motion.button>
          )}
        </div>
      )}
    </>
  )
}
