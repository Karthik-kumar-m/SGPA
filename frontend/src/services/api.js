const BASE_URL = '/api'

/**
 * Upload a PDF file for SGPA extraction.
 * @param {File} file
 * @returns {Promise<{subjects: Array, sgpa: number, total_credits: number}>}
 */
export async function uploadPDF(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
    throw new Error(error.detail || 'Upload failed')
  }

  return response.json()
}

/**
 * Save a calculated result to the database.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function saveResult(payload) {
  const response = await fetch(`${BASE_URL}/save-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Save failed' }))
    throw new Error(error.detail || 'Save failed')
  }

  return response.json()
}

/**
 * Fetch all results for a user.
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export async function getResults(userId) {
  const response = await fetch(`${BASE_URL}/results/${userId}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Fetch failed' }))
    throw new Error(error.detail || 'Fetch failed')
  }

  return response.json()
}

/**
 * Create a new user.
 * @param {{name: string, usn: string, email?: string}} payload
 * @returns {Promise<object>}
 */
export async function createUser(payload) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'User creation failed' }))
    throw new Error(error.detail || 'User creation failed')
  }

  return response.json()
}
