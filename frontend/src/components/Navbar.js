import React from 'react';

function Navbar({ user, signOut }) {
  return (
    <nav style={{ background: '#333', padding: '10px 20px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <h2 style={{ margin: 0 }}>Marketplace</h2>
      {user && (
        <div>
          <span style={{ marginRight: '10px' }}>{user.username}</span>
          <button onClick={signOut}>Sign Out</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;