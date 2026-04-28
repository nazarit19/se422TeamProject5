import React from 'react';
import { Amplify } from 'aws-amplify';
import { signUp } from 'aws-amplify/auth'
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Home from './pages/Home';
import Navbar from './components/Navbar';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      region: 'us-east-1'
    }
  }
});

export default function App() {
  return (
    <Authenticator loginMechanisms={['email']}>
      {() => <Home />}
    </Authenticator>
  )
}


export default App;