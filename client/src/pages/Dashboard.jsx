import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI } from '../api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [subResponse, plansResponse] = await Promise.all([
        subscriptionAPI.getCurrent(),
        subscriptionAPI.getPlans()
      ]);
      setSubscription(subResponse.data);
      setPlans(plansResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* User Info */}
        <div className="mb-8 border border-black rounded-lg p-6">
          <h2 className="text-xl font-bold text-black mb-4">Your Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-medium text-black">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-black">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-lg font-medium text-black capitalize">{user?.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-medium text-black">
                {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Current Subscription */}
        {subscription && (
          <div className="mb-8 border border-black rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-bold text-black mb-4">Current Subscription</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-medium text-black capitalize">
                  {subscription.plan}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-lg font-medium text-black">
                  ${subscription.planDetails?.price.toFixed(2)}/month
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing</p>
                <p className="text-lg font-medium text-black">
                  {subscription.subscription?.next_billing_date
                    ? new Date(subscription.subscription.next_billing_date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={`border-2 rounded-lg p-6 ${
                  user?.plan === key
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black'
                }`}
              >
                <h3 className="text-lg font-bold mb-2 capitalize">{key}</h3>
                <p className="text-2xl font-bold mb-4">${plan.price.toFixed(2)}</p>
                <p className="text-sm mb-4">/month</p>
                {user?.plan === key ? (
                  <button
                    disabled
                    className="w-full py-2 rounded font-medium bg-gray-600 text-white cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <Link
                    to={`/upgrade?plan=${key}`}
                    className="block w-full text-center py-2 rounded font-medium bg-black text-white hover:bg-gray-800 transition"
                  >
                    {user?.plan === 'free' || (plans[user?.plan]?.price || 0) < plan.price
                      ? 'Upgrade'
                      : 'Downgrade'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Billing Link */}
        <div className="text-center">
          <Link
            to="/billing"
            className="inline-block px-6 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
          >
            View Billing History
          </Link>
        </div>
      </main>
    </div>
  );
}
