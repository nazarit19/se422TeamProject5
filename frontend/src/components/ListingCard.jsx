import { styles } from '../constants'

export default function ListingCard({ listing, onClick }) {
  return (
    <div style={styles.card} onClick={() => onClick(listing)}>
      <div style={styles.cardImage}>
        {listing.imageUrl
          ? <img src={listing.imageUrl} alt={listing.title} style={styles.cardImg} />
          : <div style={styles.cardNoImage}>📷 No Photo</div>
        }
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardMeta}>
          <span style={styles.cardCategory}>{listing.category}</span>
          <span style={styles.cardCity}>📍 {listing.city || 'Ames'}</span>
        </div>
        <h3 style={styles.cardTitle}>{listing.title}</h3>
        {listing.price && <p style={styles.cardPrice}>${listing.price}</p>}
        <p style={styles.cardDesc}>{listing.description}</p>
      </div>
    </div>
  )
}