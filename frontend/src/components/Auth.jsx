import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { login, signup } from '../services/api'

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = isLogin
        ? { usn: formData.usn, password: formData.password }
        : {
            name: formData.name,
            usn: formData.usn,
            email: formData.email || null,
            password: formData.password,
          }

      const data = isLogin ? await login(payload) : await signup(payload)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onAuthSuccess(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md border border-[#1e293b] bg-[#0f172a] rounded-md p-6 sm:p-7">
        <div className="mb-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-400">Secure Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">SGPA Vault</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {isLogin ? 'Authenticate to open dashboard' : 'Create access credentials'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-3 py-2.5 border border-[#1e293b] bg-[#020617] rounded-sm text-slate-200 placeholder-slate-500 focus:border-cyan-400"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">USN</label>
            <input
              type="text"
              name="usn"
              value={formData.usn}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-[#1e293b] bg-[#020617] rounded-sm text-slate-200 placeholder-slate-500 uppercase font-jetbrains-mono focus:border-cyan-400"
              placeholder="4JN24CS066"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-[#1e293b] bg-[#020617] rounded-sm text-slate-200 placeholder-slate-500 focus:border-cyan-400"
                placeholder="name@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-[#1e293b] bg-[#020617] rounded-sm text-slate-200 placeholder-slate-500 focus:border-cyan-400"
              placeholder="Enter your password"
            />
            {!isLogin && <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters</p>}
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-2 rounded-sm text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setFormData({ name: '', usn: '', email: '', password: '' })
            }}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
