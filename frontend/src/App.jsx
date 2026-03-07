import { useState, useEffect } from 'react'
import { GraduationCap, LayoutDashboard, Upload as UploadIcon, Save, AlertCircle, CheckCircle, LogOut } from 'lucide-react'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'
import Auth from './components/Auth'
import { saveResult } from './services/api'

const TABS = ['Upload', 'Dashboard']

export default function App() {
  const [activeTab, setActiveTab] = useState('Upload')
  const [user, setUser] = useState(null)   // { id, name, usn }
  const [parsedResult, setParsedResult] = useState(null)
  const [saveForm, setSaveForm] = useState({ semester: '' })
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
    setSaveForm({ semester: '' })
    setSaveStatus({ type: '', message: '' })
  }

  // -------------------------------------------------------------------------
  // Save result after upload
  // -------------------------------------------------------------------------
  const handleSaveResult = async (e) => {
    e.preventDefault()
    if (!parsedResult || !user || !saveForm.semester) return
    setSaveStatus({ type: '', message: '' })
    try {
      await saveResult({
        user_id: user.id,
        semester: parseInt(saveForm.semester, 10),
        sgpa: parsedResult.sgpa,
        total_credits: parsedResult.total_credits,
        subjects: parsedResult.subjects,
      })
      setSaveStatus({ type: 'success', message: 'Result saved successfully!' })
      setParsedResult(null)
      setSaveForm({ semester: '' })
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xl">
                <GraduationCap className="w-7 h-7" />
                SGPA Vault
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {user.name} · <span className="font-mono">{user.usn}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Tab navigation */}
            <div className="flex gap-2 border-b border-gray-200">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-4 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors
                    ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab === 'Upload' ? <UploadIcon className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Upload tab */}
            {activeTab === 'Upload' && (
              <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-700">Upload VTU Result PDF</h2>
                <FileUpload onResult={setParsedResult} />

                {/* Parsed result preview */}
                {parsedResult && (
                  <div className="border border-indigo-100 rounded-2xl p-4 bg-indigo-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-indigo-700">Parsed Result</h3>
                      <span className="text-2xl font-bold text-indigo-700">{parsedResult.sgpa} SGPA</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Total Credits: {parsedResult.total_credits}</p>

                    {/* Subjects table */}
                    <div className="overflow-x-auto rounded-xl">
                      <table className="min-w-full bg-white text-xs">
                        <thead className="bg-indigo-100 text-indigo-700 uppercase">
                          <tr>
                            <th className="px-3 py-2 text-left">Subject Code</th>
                            <th className="px-3 py-2 text-left">Credits</th>
                            <th className="px-3 py-2 text-left">Grade</th>
                            <th className="px-3 py-2 text-left">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {parsedResult.subjects.map((s) => (
                            <tr key={s.subject_code}>
                              <td className="px-3 py-2 font-mono">{s.subject_code}</td>
                              <td className="px-3 py-2">{s.credits}</td>
                              <td className="px-3 py-2 font-semibold">{s.grade}</td>
                              <td className="px-3 py-2">{s.grade_points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Save form */}
                    <form onSubmit={handleSaveResult} className="mt-4 flex items-center gap-3">
                      <select
                        required
                        value={saveForm.semester}
                        onChange={(e) => setSaveForm({ semester: e.target.value })}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        <option value="">Select Semester</option>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save to Dashboard
                      </button>
                    </form>
                    {saveStatus.message && (
                      <div className={`flex items-center gap-2 mt-2 text-sm ${saveStatus.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                        {saveStatus.type === 'error'
                          ? <AlertCircle className="w-4 h-4" />
                          : <CheckCircle className="w-4 h-4" />}
                        {saveStatus.message}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Dashboard tab */}
            {activeTab === 'Dashboard' && (
              <section className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-6">Your Dashboard</h2>
                <Dashboard userId={user?.id} />
              </section>
            )}
          </main>
        </div>
      )}
    </>
  )
}
