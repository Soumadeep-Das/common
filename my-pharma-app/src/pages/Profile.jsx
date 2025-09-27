import React, { useEffect, useState } from 'react';
import { getProfile } from '../api'; // You need to implement this API call

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(data => setProfile(data));
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2>Welcome, {profile.username}!</h2>
      <div className="mt-4">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
};

export default Profile;