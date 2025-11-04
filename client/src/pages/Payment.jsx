import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI } from '../api';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const plan = searchParams.get('plan') || 'pro';
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('payment'); // payment, processing, success
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    billingEmail: user?.email || '',
    billingAddress: '',
    billingCity: '',
    billingZip: '',
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }

    // Format CVV (numbers only)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const validateForm = () => {
    if (!formData.cardName.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      setError('Card number must be 16 digits');
      return false;
    }
    if (!formData.expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Expiry date must be MM/YY');
      return false;
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      setError('CVV must be 3-4 digits');
      return false;
    }
    if (!formData.billingAddress.trim()) {
      setError('Billing address is required');
      return false;
    }
    if (!formData.billingCity.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.billingZip.trim()) {
      setError('ZIP code is required');
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStep('processing');

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        await subscriptionAPI.upgrade(plan);
        await fetchUser();
        setStep('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Payment failed');
        setStep('payment');
        setLoading(false);
      }
    }, 2000);
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Processing Payment</h1>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-black mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-2">
            Your plan has been upgraded to <strong className="text-black capitalize">{plan}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            A confirmation email has been sent to {formData.billingEmail}
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Secure Payment</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Cardholder Information */}
              <div className="border border-black rounded-lg p-6">
                <h2 className="text-lg font-bold text-black mb-4">Cardholder Information</h2>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              {/* Card Details */}
              <div className="border border-black rounded-lg p-6">
                <h2 className="text-lg font-bold text-black mb-4">Card Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black font-mono"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">Test: 4532 1234 5678 9010</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black font-mono"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1">Test: 12/25</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black font-mono"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1">Test: 123</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="border border-black rounded-lg p-6">
                <h2 className="text-lg font-bold text-black mb-4">Billing Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="billingEmail"
                      value={formData.billingEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main St"
                      className="w-full px-4 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        placeholder="New York"
                        className="w-full px-4 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="billingZip"
                        value={formData.billingZip}
                        onChange={handleInputChange}
                        placeholder="10001"
                        className="w-full px-4 py-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the terms and conditions and authorize this payment
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Link
                  to="/dashboard"
                  className="flex-1 text-center py-3 border border-black text-black rounded font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:bg-gray-400 transition"
                >
                  {loading ? 'Processing...' : `Pay $${(plans[plan]?.price || 0).toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="border border-black rounded-lg p-6 bg-gray-50 sticky top-8">
              <h2 className="text-lg font-bold text-black mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="text-lg font-bold text-black capitalize">{plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Billing Cycle</p>
                  <p className="text-lg font-bold text-black">Monthly</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-black">
                    ${(plans[plan]?.price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-black">$0.00</span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-black">Total:</span>
                  <span className="text-2xl font-bold text-black">
                    ${(plans[plan]?.price || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Renews monthly on the same date
                </p>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Demo Mode:</strong> This is a simulated payment. No actual charges will be made.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
