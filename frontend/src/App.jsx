import { useState } from 'react'
import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import Home from './pages/Home'
 
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      region: 'us-east-1'
    }
  }
})
 
export default function App() {
  const [activeSection, setActiveSection] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
 
  return (
    <Authenticator.Provider>
      <Home
        activeSection={activeSection}
        activeCategory={activeCategory}
        setActiveSection={setActiveSection}
        setActiveCategory={setActiveCategory}
      />
    </Authenticator.Provider>
  )
}