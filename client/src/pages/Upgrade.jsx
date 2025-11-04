import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI } from '../api';

export default function Upgrade() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [newPlan, setNewPlan] = useState(searchParams.get('plan') || 'pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [plans, setPlans] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPlans();
  }, [user, navigate]);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionAPI.getPlans();
      setPlans(response.data);
    } catch (err) {
      setError('Failed to load plans');
    }
  };

  const handleUpgrade = async () => {
    if (!newPlan) {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await subscriptionAPI.upgrade(newPlan);
      setSuccess(true);
      await fetchUser();
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upgrade');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-black mb-2">Success!</h1>
          <p className="text-gray-600 mb-6">
            Your plan has been updated to <strong>{newPlan}</strong>
          </p>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-black font-medium hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-2">Upgrade Your Plan</h1>
        <p className="text-gray-600 mb-8">
          Current plan: <strong className="text-black capitalize">{user?.plan}</strong>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Plan Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4">Select a Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                onClick={() => setNewPlan(key)}
                className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                  newPlan === key
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white text-black hover:border-black'
                }`}
              >
                <h3 className="text-lg font-bold mb-2 capitalize">{key}</h3>
                <p className="text-3xl font-bold mb-2">${plan.price.toFixed(2)}</p>
                <p className="text-sm">/month</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border border-black rounded-lg p-6 mb-8 bg-gray-50">
          <h2 className="text-xl font-bold text-black mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Plan:</span>
              <span className="font-medium text-black capitalize">{user?.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Plan:</span>
              <span className="font-medium text-black capitalize">{newPlan}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="font-bold text-black">Total:</span>
              <span className="font-bold text-black">
                ${(plans[newPlan]?.price || 0).toFixed(2)}/month
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            This is a simulated payment. Your plan will be updated immediately.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            to="/dashboard"
            className="flex-1 text-center py-3 border border-black text-black rounded font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 py-3 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:bg-gray-400 transition"
          >
            {loading ? 'Processing...' : 'Confirm & Upgrade'}
          </button>
        </div>
      </main>
    </div>
  );
}
