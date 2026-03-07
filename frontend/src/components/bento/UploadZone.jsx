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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full rounded-xl border border-[#1e293b] bg-[#0f172a]"
    >
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="w-full mb-4 flex items-center justify-between border-b border-[#1e293b] pb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-400">Terminal Upload</p>
          <p className="text-[10px] text-slate-500">PDF.Parser.v2</p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-full flex flex-col items-center justify-center cursor-pointer border rounded-md transition-colors ${
            isDragging ? 'border-cyan-400 bg-cyan-500/5' : 'border-[#1e293b]'
          }`}
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
                <Upload className={`w-10 h-10 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <p className="text-slate-200 font-semibold text-sm">
                    Drag VTU result PDF into terminal
                  </p>
                  <p className="text-slate-500 text-xs mt-1">or click to browse filesystem</p>
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
                <FileText className="w-10 h-10 text-cyan-400" />
                <div className="text-center max-w-[200px]">
                  <p className="text-slate-200 font-semibold text-sm truncate">{file.name}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={handleUpload}
                  className="mt-3 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-md text-slate-950 text-sm font-semibold transition-colors"
                >
                  Parse File
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
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                <p className="text-slate-300 text-sm font-medium">Parsing your PDF...</p>
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
                  <CheckCircle className="w-12 h-12 text-cyan-400" />
                </motion.div>
                <div className="text-center">
                  <p className="text-cyan-400 text-sm font-medium">{message}</p>
                  <p className="text-slate-500 text-xs mt-1">Result added to semester grid</p>
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
                    <p className="text-slate-400 text-xs mt-2 hover:text-slate-300">Try again</p>
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
