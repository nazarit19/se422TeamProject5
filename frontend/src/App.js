import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Home from './pages/Home';
import Navbar from './components/Navbar';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      region: 'us-east-1'
    }
  }
});

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <Navbar user={user} signOut={signOut} />
          <Home />
        </div>
      )}
    </Authenticator>
  );
}

export default App;