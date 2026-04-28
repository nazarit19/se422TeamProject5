import { useState } from 'react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { SECTIONS, FIELD_LABELS, TEXTAREA_FIELDS, BOOL_FIELDS, styles } from '../constants'

export default function PostListingForm({ onClose, onPosted }) {
  const { user } = useAuthenticator((context) => [context.user])
  const [step, setStep] = useState(1)
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [form, setForm] = useState({ title: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const categoryFields = selectedSection && selectedCategory
    ? SECTIONS[selectedSection].categories.find(c => c.name === selectedCategory)?.fields || []
    : []

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const uploadImage = async () => {
    if (!imageFile) return null
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}images/upload-url?filename=${imageFile.name}&contentType=${imageFile.type}`
      )
      const { uploadUrl, imageUrl } = await res.json()
      await fetch(uploadUrl, { method: 'PUT', body: imageFile, headers: { 'Content-Type': imageFile.type } })
      return imageUrl
    } catch {
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const missing = categoryFields.filter(f => !form[f] && !BOOL_FIELDS.includes(f))
    if (!form.title || missing.length > 0) {
      setError(`Please fill in all fields: ${missing.map(f => FIELD_LABELS[f] || f).join(', ')}`)
      setLoading(false)
      return
    }

    try {
      const imageUrl = await uploadImage()
      const res = await fetch(`${import.meta.env.VITE_API_URL}listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          section: selectedSection,
          category: selectedCategory,
          userId: user.username,
          imageUrl,
          createdAt: new Date().toISOString()
        })
      })
      if (!res.ok) throw new Error('Failed to post listing')
      onPosted()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modal, maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 style={styles.modalTitle}>Post an Ad</h2>

        {step === 1 && (
          <div>
            <p style={styles.stepLabel}>Step 1: Choose a section and category</p>
            {Object.entries(SECTIONS).map(([section, { icon, categories }]) => (
              <div key={section} style={{ marginBottom: '16px' }}>
                <div style={styles.sectionHeader}>{icon} {section}</div>
                <div style={styles.categoryGrid}>
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      style={{
                        ...styles.categoryBtn,
                        ...(selectedSection === section && selectedCategory === cat.name ? styles.categoryBtnActive : {})
                      }}
                      onClick={() => { setSelectedSection(section); setSelectedCategory(cat.name) }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              style={{ ...styles.btnPrimary, width: '100%', marginTop: '8px' }}
              disabled={!selectedSection || !selectedCategory}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <p style={styles.stepLabel}>
              <span>Step 2: {selectedSection} › {selectedCategory}</span>
              <button type="button" style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
            </p>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.formGroup}>
              <label style={styles.label}>Listing Title *</label>
              <input
                style={styles.input}
                name="title"
                value={form.title || ''}
                onChange={handleChange}
                placeholder="Brief title for your listing"
                required
              />
            </div>

            {categoryFields.map(field => (
              <div key={field} style={styles.formGroup}>
                <label style={styles.label}>{FIELD_LABELS[field] || field} *</label>
                {BOOL_FIELDS.includes(field) ? (
                  <select style={styles.input} name={field} value={form[field] || ''} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : TEXTAREA_FIELDS.includes(field) ? (
                  <textarea
                    style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                    name={field}
                    value={form[field] || ''}
                    onChange={handleChange}
                    placeholder={`Enter ${FIELD_LABELS[field] || field}...`}
                    required
                  />
                ) : (
                  <input
                    style={styles.input}
                    name={field}
                    value={form[field] || ''}
                    onChange={handleChange}
                    placeholder={`Enter ${FIELD_LABELS[field] || field}`}
                    required
                  />
                )}
              </div>
            ))}

            <div style={styles.formGroup}>
              <label style={styles.label}>Photo (optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '14px' }} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{ marginTop: '8px', width: '100%', borderRadius: '6px', maxHeight: '200px', objectFit: 'cover' }} />
              )}
            </div>

            <button type="submit" style={{ ...styles.btnPrimary, width: '100%' }} disabled={loading}>
              {loading ? 'Posting...' : '📌 Post Listing'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}