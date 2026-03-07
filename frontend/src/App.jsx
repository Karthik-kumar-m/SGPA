import { useState, useEffect } from 'react'
import {
  GraduationCap,
  LayoutDashboard,
  Upload as UploadIcon,
  Save,
  AlertCircle,
  CheckCircle,
  LogOut,
  X,
} from 'lucide-react'
import FileUpload from './components/FileUpload'
import BentoDashboard from './components/BentoDashboard'
import Auth from './components/Auth'
import { saveResult } from './services/api'
import { motion } from 'framer-motion'

export default function App() {
  const [activeTab, setActiveTab] = useState('Upload')
  const [user, setUser] = useState(null)
  const [parsedResult, setParsedResult] = useState(null)
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

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

  const handleSaveResult = async (e) => {
    e.preventDefault()
    if (!parsedResult || !user) return

    setSaveStatus({ type: '', message: '' })
    try {
      await saveResult({
        user_id: user.id,
        semester: parsedResult.semester,
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
      {!user && <Auth onAuthSuccess={handleAuthSuccess} />}

      {user && (
        <div className="min-h-screen bg-[#020617]">
          <header className="sticky top-0 z-20 bg-[#020617] border-b border-[#1e293b]">
            <div className="px-4 py-4 lg:px-8 flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="p-2 rounded-sm bg-[#0f172a] border border-[#1e293b]">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-100">SGPA Vault</h1>
                  <p className="text-[11px] text-slate-500">Cyber-Flat Performance Tracker</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="hidden sm:flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-10 h-10 rounded-sm bg-[#0f172a] border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium text-sm">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-jetbrains-mono">{user.usn}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-slate-300 hover:text-rose-300 border border-[#1e293b] hover:border-rose-500/50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </motion.div>
            </div>
          </header>

          <main>
            {activeTab === 'Dashboard' ? (
              <BentoDashboard userId={user?.id} parsedResult={parsedResult} onResult={setParsedResult} />
            ) : (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md bg-[#0f172a] border border-[#1e293b]"
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[#1e293b] bg-[#0f172a]">
                    <h2 className="text-xl font-bold text-slate-100">Upload Result PDF</h2>
                    <motion.button
                      whileHover={{ y: -1 }}
                      onClick={() => setActiveTab('Dashboard')}
                      className="p-2 rounded-sm border border-[#1e293b] hover:border-cyan-400 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </motion.button>
                  </div>

                  <div className="p-6 space-y-6">
                    <FileUpload onResult={setParsedResult} />

                    {parsedResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-[#1e293b] rounded-sm p-5 bg-[#020617]"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-slate-100 text-lg">Parsed Result</h3>
                          <span className="text-3xl font-bold text-cyan-400">{parsedResult.sgpa}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                          Semester: <span className="text-cyan-300 font-semibold">{parsedResult.semester}</span> •
                          Total Credits: <span className="text-cyan-300 font-semibold"> {parsedResult.total_credits}</span>
                        </p>

                        <div className="overflow-x-auto rounded-sm mb-6 border border-[#1e293b]">
                          <table className="w-full text-xs">
                            <thead className="bg-[#0b1222] border-b border-[#1e293b]">
                              <tr>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Code</th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Credits</th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Grade</th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Points</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e293b]">
                              {parsedResult.subjects.map((s) => (
                                <tr key={s.subject_code} className="hover:bg-[#0f172a]">
                                  <td className="px-4 py-3 font-jetbrains-mono text-cyan-300">{s.subject_code}</td>
                                  <td className="px-4 py-3 text-slate-400">{s.credits}</td>
                                  <td className="px-4 py-3 font-bold text-slate-200">{s.grade}</td>
                                  <td className="px-4 py-3 text-cyan-400">{s.grade_points}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <motion.form onSubmit={handleSaveResult} className="flex gap-3">
                          <motion.button
                            whileHover={{ y: -1 }}
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-sm transition-colors"
                          >
                            <Save className="w-5 h-5" />
                            Save Result
                          </motion.button>
                          <motion.button
                            whileHover={{ y: -1 }}
                            type="button"
                            onClick={() => setActiveTab('Dashboard')}
                            className="px-6 py-3 rounded-sm border border-[#1e293b] text-slate-300 hover:border-cyan-500 transition-colors"
                          >
                            Later
                          </motion.button>
                        </motion.form>

                        {saveStatus.message && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-2 mt-4 p-3 rounded-sm text-sm border ${
                              saveStatus.type === 'error'
                                ? 'text-rose-300 bg-rose-500/10 border-rose-500/30'
                                : 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
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

                    {!parsedResult && (
                      <p className="text-sm text-slate-500 text-center mt-6">
                        After uploading, your parsed result will be shown here.
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </main>

          {user && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              onClick={() => setActiveTab(activeTab === 'Dashboard' ? 'Upload' : 'Dashboard')}
              className="fixed bottom-6 right-6 z-40 p-3 rounded-sm bg-cyan-500 text-slate-950 border border-cyan-400 transition-colors lg:hidden"
              title={activeTab === 'Dashboard' ? 'Upload' : 'Dashboard'}
            >
              {activeTab === 'Dashboard' ? (
                <UploadIcon className="w-5 h-5" />
              ) : (
                <LayoutDashboard className="w-5 h-5" />
              )}
            </motion.button>
          )}
        </div>
      )}
    </>
  )
}
