import { FIELD_LABELS, styles } from '../constants'

export default function ListingDetailModal({ listing, onClose }) {
  if (!listing) return null
  const skipFields = ['id', 'userId', 'createdAt', 'imageUrl', 'section', 'title', 'category']

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
        {listing.imageUrl && (
          <img src={listing.imageUrl} alt={listing.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />
        )}
        <div style={styles.cardMeta}>
          <span style={styles.cardCategory}>{listing.category}</span>
          <span style={styles.cardCity}>📍 {listing.city || 'Ames'}</span>
        </div>
        <h2 style={{ margin: '8px 0 16px' }}>{listing.title}</h2>
        {listing.price && <p style={{ ...styles.cardPrice, fontSize: '24px' }}>${listing.price}</p>}
        <div style={styles.detailGrid}>
          {Object.entries(listing)
            .filter(([k]) => !skipFields.includes(k))
            .map(([key, val]) => (
              <div key={key} style={styles.detailRow}>
                <span style={styles.detailLabel}>{FIELD_LABELS[key] || key}</span>
                <span style={styles.detailValue}>{val}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}