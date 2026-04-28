import { useAuthenticator } from '@aws-amplify/ui-react'
import { SECTIONS, styles } from '../constants'

export default function Navbar({ activeSection, setActiveSection, setActiveCategory, onPostClick, onLoginClick }) {
	const { user, signOut } = useAuthenticator((context) => [context.user])

	const handleSection = (section) => {
		setActiveSection(section)
		setActiveCategory(null)
	}

	return (
		<header style={styles.header}>
			<div style={styles.headerTop}>
				<div style={styles.logo} onClick={() => { setActiveSection(null); setActiveCategory(null) }}>
					<span style={styles.logoIcon}>📌</span>
					<div>
						<div style={styles.logoTitle}>Ames Classifieds</div>
						<div style={styles.logoSub}>Ames, Iowa</div>
					</div>
				</div>
				<div style={styles.headerActions}>
					{user ? (
						<>
							<span style={styles.userBadge}>👤 {user.username}</span>
							<button style={styles.btnPost} onClick={onPostClick}>+ Post Ad</button>
							<button style={styles.btnSignOut} onClick={signOut}>Sign Out</button>
						</>
					) : (
						<>
							<span style={styles.visitorBadge}>Browse as visitor</span>
							<button style={styles.btnPost} onClick={onLoginClick}>Sign In / Register</button>
						</>
					)}
				</div>
			</div>
			<nav style={styles.sectionNav}>
				{Object.entries(SECTIONS).map(([section, { icon }]) => (
					<button
						key={section}
						style={{ ...styles.sectionBtn, ...(activeSection === section ? styles.sectionBtnActive : {}) }}
						onClick={() => handleSection(section)}
					>
						{icon} {section}
					</button>
				))}
			</nav>
		</header>
	)
}