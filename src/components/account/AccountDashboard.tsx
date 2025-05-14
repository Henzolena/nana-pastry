import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const AccountDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    // This component should ideally only be rendered for logged-in users,
    // but a fallback is good practice.
    return <p>Please log in to view your dashboard.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown">Welcome, {user.displayName || user.email}!</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Links/Summary Cards */}
        <div className="bg-warmgray-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-heading text-hotpink mb-2">Your Orders</h3>
          <p className="text-warmgray-700 font-body text-sm">View your past and current orders.</p>
          <Link to="/account?tab=orders" className="text-hotpink hover:underline text-sm font-body mt-2 inline-block">
            Go to Order History
          </Link>
        </div>

        <div className="bg-warmgray-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-heading text-hotpink mb-2">Your Profile</h3>
          <p className="text-warmgray-700 font-body text-sm">Manage your personal information and settings.</p>
          <Link to="/account?tab=settings" className="text-hotpink hover:underline text-sm font-body mt-2 inline-block">
            Update Profile
          </Link>
        </div>

        {/* TODO: Add more dashboard content like recent orders summary, featured products, etc. */}
      </div>

      {/* Example of displaying user info (can be moved/styled) */}
      {/* <div>
        <p>Logged in as: {user.email}</p>
        {user.displayName && <p>Display Name: {user.displayName}</p>}
        {user.emailVerified ? <p className="text-green-600">Email Verified</p> : <p className="text-red-600">Email Not Verified</p>}
      </div> */}
    </div>
  );
};

export default AccountDashboard;
