import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [metadataList, setMetadataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('📌 Dashboard component mounted — starting data fetch...');


fetch('http://localhost:8000/api/metadata', {
  headers: {
    Accept: 'application/json',
  },
})


    // fetch('/api/metadata', {
    //   headers: {
    //     Accept: 'application/json',
    //   },
    // })
      .then((response) => {
        console.log('📥 API response received:', response);

        // If the response is not OK (2xx) throw an error
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Make sure it's actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        return response.json();
      })
      .then((data) => {
        console.log('📄 Parsed JSON data:', data);
        if (data.success) {
          setMetadataList(data.data);
          console.log('✅ Metadata list updated with', data.data.length, 'items');
        } else {
          setError('Failed to load metadata');
          console.log('❌ Error: Failed to load metadata from API');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('🚨 Fetch error:', err);
        setError(err.message || 'Error fetching data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    console.log('⏳ Loading state active...');
    return <p>Loading...</p>;
  }

  if (error) {
    console.log('⚠️ Error state active:', error);
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  console.log('📊 Rendering table with', metadataList.length, 'rows');

  return (
    <div>
      <h2>Metadata Table</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Video Name</th>
            <th>Created At</th>
            <th>User ID</th>
          </tr>
        </thead>
        <tbody>
          {metadataList.map((item, index) => {
            console.log(`📝 Filling table row ${index + 1}:`, item);
            return (
              <tr key={item.id}>
                <td>{item.video_name}</td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
                <td>{item.user_id}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
