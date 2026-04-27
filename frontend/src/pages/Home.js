import React, { useEffect, useState } from 'react';

function Home() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/listings')
      .then(res => res.json())
      .then(data => setListings(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Marketplace</h1>
      {listings.length === 0 ? (
        <p>No listings yet.</p>
      ) : (
        listings.map(listing => (
          <div key={listing.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <p>${listing.price}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;