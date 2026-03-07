import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { uploadPDF } from '../../services/api'

/**
 * UploadZone - Sleek drag-and-drop area for result PDFs
 */
export default function UploadZone({ onResult }) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const processFile = useCallback((f) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error')
      setMessage('Only PDF files are supported.')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }
    setFile(f)
    setStatus('idle')
    setMessage('')
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) processFile(dropped)
  }, [processFile])

  const handleFileChange = useCallback((e) => {
    const selected = e.target.files[0]
    if (selected) processFile(selected)
  }, [processFile])

  const handleUpload = async () => {
    if (!file) return
    setStatus('loading')
    setMessage('')

    try {
      const result = await uploadPDF(file)
      setStatus('success')
      setMessage(`Parsed! SGPA: ${result.sgpa}`)
      onResult(result)

      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null)
        setStatus('idle')
      }, 2000)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Failed to parse PDF.')
    }
  }

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
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
            id="pdf-upload"
          />

          <AnimatePresence mode="wait">
            {status === 'idle' && !file && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Upload className={`w-12 h-12 ${isDragging ? 'text-indigo-400' : 'text-gray-400'}`} />
                </motion.div>
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <p className="text-gray-200 font-semibold text-sm">
                    Drop your VTU result PDF here
                  </p>
                  <p className="text-gray-400 text-xs mt-1">or click to browse</p>
                </label>
              </motion.div>
            )}

            {file && status === 'idle' && (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3 w-full"
              >
                <FileText className="w-12 h-12 text-indigo-400" />
                <div className="text-center max-w-[200px]">
                  <p className="text-gray-200 font-semibold text-sm truncate">{file.name}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpload}
                  className="mt-3 px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                >
                  Parse PDF
                </motion.button>
              </motion.div>
            )}

            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-gray-300 text-sm font-medium">Parsing your PDF…</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                </motion.div>
                <div className="text-center">
                  <p className="text-emerald-400 text-sm font-medium">{message}</p>
                  <p className="text-gray-400 text-xs mt-1">Result added to your dashboard</p>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3"
              >
                <AlertCircle className="w-12 h-12 text-red-400" />
                <div className="text-center">
                  <p className="text-red-400 text-sm font-medium">{message}</p>
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <p className="text-gray-400 text-xs mt-2 hover:text-gray-300">Try again</p>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
