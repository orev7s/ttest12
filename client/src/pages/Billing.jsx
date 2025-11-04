import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI } from '../api';

export default function Billing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);
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
      const [historyResponse, subResponse] = await Promise.all([
        subscriptionAPI.getHistory(),
        subscriptionAPI.getCurrent()
      ]);
      setHistory(historyResponse.data);
      setSubscription(subResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-black font-medium hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Billing</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Current Subscription */}
        {subscription && (
          <div className="mb-8 border border-black rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-bold text-black mb-4">Current Subscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-medium text-black capitalize">
                  {subscription.plan}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Price</p>
                <p className="text-lg font-medium text-black">
                  ${subscription.planDetails?.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-medium text-black capitalize">
                  {subscription.subscription?.status || 'active'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="text-lg font-medium text-black">
                  {subscription.subscription?.next_billing_date
                    ? new Date(subscription.subscription.next_billing_date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="inline-block px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
            >
              Change Plan
            </Link>
          </div>
        )}

        {/* Billing History */}
        <div className="border border-black rounded-lg overflow-hidden">
          <div className="bg-black text-white p-6">
            <h2 className="text-xl font-bold">Billing History</h2>
          </div>

          {history.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No billing history yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-bold text-black">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-black">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-black">Plan</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-black">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-black">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-black">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-black capitalize">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-black capitalize">
                        {item.plan}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-white text-xs font-medium ${
                            item.status === 'completed'
                              ? 'bg-green-600'
                              : item.status === 'pending'
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invoice Note */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-300 rounded text-sm text-gray-600">
          <p>
            <strong>Note:</strong> This is a simulated billing system. Payments are not actually processed.
            All transactions shown here are for demonstration purposes only.
          </p>
        </div>
      </main>
    </div>
  );
}
