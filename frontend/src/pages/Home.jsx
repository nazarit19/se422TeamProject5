import { useState } from 'react'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import { SECTIONS, styles } from '../constants'
import Navbar from '../components/Navbar'
import ListingCard from '../components/ListingCard'
import ListingDetailModal from '../components/ListingDetailModal'
import PostListingForm from '../components/PostingListingForm'

export default function Home({ activeSection, activeCategory, setActiveSection, setActiveCategory }) {
	const [listings, setListings] = useState([])
	const [loading, setLoading] = useState(false)
	const [search, setSearch] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [selectedListing, setSelectedListing] = useState(null)
	const { user } = useAuthenticator((context) => [context.user])
	const [showAuth, setShowAuth] = useState(false)

	const onLoginClick = () => { setShowAuth(true) }

	const fetchListings = async () => {
		setLoading(true)
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}listings`)
			const data = await res.json()
			setListings(Array.isArray(data) ? data : [])
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	useState(() => { fetchListings() }, [])

	const filtered = listings.filter(l => {
		const matchSection = !activeSection || l.section === activeSection
		const matchCategory = !activeCategory || l.category === activeCategory
		const matchSearch = !search ||
			l.title?.toLowerCase().includes(search.toLowerCase()) ||
			l.description?.toLowerCase().includes(search.toLowerCase())
		return matchSection && matchCategory && matchSearch
	})

	return (
		<>
			{showAuth && (
				<div style={styles.modalOverlay} onClick={() => setShowAuth(false)}>
					<div style={{ ...styles.modal, maxWidth: "800px" }} onClick={e => e.stopPropagation()}>
						<button style={styles.closeBtn} onClick={() => setShowAuth(false)}>✕</button>
						<Authenticator loginMechanisms={['email']} />
					</div>
				</div>
			)}
			<div style={styles.page}>
				<Navbar
					activeSection={activeSection}
					setActiveSection={setActiveSection}
					setActiveCategory={setActiveCategory}
					onPostClick={() => setShowForm(true)}
					onLoginClick={onLoginClick}
				/>

				{showForm && user && (
					<PostListingForm onClose={() => setShowForm(false)} onPosted={fetchListings} />
				)}

				{selectedListing && (
					<ListingDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
				)}

				<div style={styles.container}>

					{/* Breadcrumb */}
					<div style={styles.breadcrumb}>
						<span style={styles.breadcrumbItem} onClick={() => { setActiveSection(null); setActiveCategory(null) }}>All</span>
						{activeSection && <>
							<span style={styles.breadcrumbSep}>›</span>
							<span style={styles.breadcrumbItem} onClick={() => setActiveCategory(null)}>{activeSection}</span>
						</>}
						{activeCategory && <>
							<span style={styles.breadcrumbSep}>›</span>
							<span style={{ ...styles.breadcrumbItem, fontWeight: '600' }}>{activeCategory}</span>
						</>}
					</div>

					{/* Section landing — show categories */}
					{activeSection && !activeCategory && (
						<div style={styles.categoryLanding}>
							<h2 style={styles.sectionTitle}>
								{SECTIONS[activeSection].icon} {activeSection}
							</h2>
							<div style={styles.categoryLandingGrid}>
								{SECTIONS[activeSection].categories.map(cat => (
									<button
										key={cat.name}
										style={styles.categoryLandingBtn}
										onClick={() => setActiveCategory(cat.name)}
									>
										<span style={styles.categoryLandingName}>{cat.name}</span>
										<span style={styles.categoryLandingCount}>
											{listings.filter(l => l.section === activeSection && l.category === cat.name).length} listings
										</span>
									</button>
								))}
							</div>
						</div>
					)}

					{/* Search bar */}
					{(!activeSection || activeCategory) && (
						<div style={styles.searchRow}>
							<input
								style={{ ...styles.input, flex: 1, maxWidth: '500px' }}
								placeholder={`Search ${activeCategory || activeSection || 'all listings'}...`}
								value={search}
								onChange={e => setSearch(e.target.value)}
							/>
						</div>
					)}

					{/* Listings grid */}
					{(!activeSection || activeCategory) && (
						<>
							{loading && <p style={styles.status}>Loading listings...</p>}
							{!loading && filtered.length === 0 && (
								<div style={styles.emptyState}>
									<p style={{ fontSize: '48px', margin: 0 }}>📭</p>
									<p>No listings found.</p>
									{user && (
										<button style={styles.btnPrimary} onClick={() => setShowForm(true)}>
											Be the first to post!
										</button>
									)}
								</div>
							)}
							<div style={styles.grid}>
								{filtered.map(listing => (
									<ListingCard key={listing.id} listing={listing} onClick={setSelectedListing} />
								))}
							</div>
						</>
					)}

					{/* Homepage — show all sections */}
					{!activeSection && (
						<div style={styles.homeSections}>
							<h2 style={styles.homeTitle}>Browse by Section</h2>
							<div style={styles.homeSectionGrid}>
								{Object.entries(SECTIONS).map(([section, { icon, categories }]) => (
									<div key={section} style={styles.homeSectionCard}>
										<div style={styles.homeSectionHeader} onClick={() => setActiveSection(section)}>
											<span style={{ fontSize: '28px' }}>{icon}</span>
											<span style={styles.homeSectionName}>{section}</span>
										</div>
										<ul style={styles.homeCategoryList}>
											{categories.map(cat => (
												<li
													key={cat.name}
													style={styles.homeCategoryItem}
													onClick={() => { setActiveSection(section); setActiveCategory(cat.name) }}
												>
													{cat.name}
													<span style={styles.homeCategoryCount}>
														{listings.filter(l => l.section === section && l.category === cat.name).length}
													</span>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	)
}