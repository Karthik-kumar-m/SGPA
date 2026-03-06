import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { uploadPDF } from '../services/api'

/**
 * FileUpload component with drag-and-drop support.
 * Calls onResult(parsedResult) when parsing succeeds.
 */
export default function FileUpload({ onResult }) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = useCallback((f) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error')
      setMessage('Only PDF files are supported.')
      return
    }
    setFile(f)
    setStatus('idle')
    setMessage('')
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) processFile(dropped)
  }, [processFile])

  const handleUpload = async () => {
    if (!file) return
    setStatus('loading')
    setMessage('')

    try {
      const result = await uploadPDF(file)
      setStatus('success')
      setMessage(`Parsed successfully – SGPA: ${result.sgpa}`)
      onResult(result)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'An unexpected error occurred.')
    }
  }

  const handleFileChange = useCallback((e) => {
    const selected = e.target.files[0]
    if (selected) processFile(selected)
  }, [processFile])

  return (
    <div className="max-w-xl mx-auto">
      {/* Drop zone */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-2xl cursor-pointer transition-colors
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Upload className="w-10 h-10 text-indigo-400 mb-3" />
        <p className="text-sm font-medium text-gray-600">
          {file ? file.name : 'Drag & drop your VTU result PDF here'}
        </p>
        <p className="text-xs text-gray-400 mt-1">or click to browse</p>
      </label>

      {/* Status feedback */}
      {status === 'success' && (
        <div className="flex items-center gap-2 mt-3 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || status === 'loading'}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Parsing PDF…
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Calculate SGPA
          </>
        )}
      </button>
    </div>
  )
}
