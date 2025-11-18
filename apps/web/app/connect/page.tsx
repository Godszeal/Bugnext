'use client';

import { useState } from 'react';
import { Phone, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConnectPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [loading, setLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPairingCode(null);

    try {
      const fullNumber = `${countryCode}${phoneNumber}`.replace(/[^0-9]/g, '');
      
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      setSessionId(data.sessionId);
      setPairingCode(data.pairingCode);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8">
            <Phone className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Connect WhatsApp
            </h1>
          </div>

          {!pairingCode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country Code
                </label>
                <select
                  id="countryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="+1">United States (+1)</option>
                  <option value="+44">United Kingdom (+44)</option>
                  <option value="+234">Nigeria (+234)</option>
                  <option value="+91">India (+91)</option>
                  <option value="+62">Indonesia (+62)</option>
                  <option value="+55">Brazil (+55)</option>
                  <option value="+27">South Africa (+27)</option>
                  <option value="+254">Kenya (+254)</option>
                  <option value="+971">UAE (+971)</option>
                  <option value="+966">Saudi Arabia (+966)</option>
                </select>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number (without country code)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    {countryCode}
                  </span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="8089336992"
                    required
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Example: For {countryCode}8089336992, enter: 8089336992
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    Generating Pairing Code...
                  </>
                ) : (
                  'Get Pairing Code'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Pairing Code
                </h2>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-4">
                  <p className="text-5xl font-mono font-bold text-green-600 tracking-wider">
                    {pairingCode}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Session ID: <span className="font-mono text-xs">{sessionId}</span>
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-left">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">How to use this code:</h3>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">1.</span>
                    <span>Open WhatsApp on your phone</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">2.</span>
                    <span>Go to Settings → Linked Devices → Link a Device</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">3.</span>
                    <span>Tap "Link with phone number instead"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">4.</span>
                    <span>Enter the pairing code shown above</span>
                  </li>
                </ol>
              </div>

              <div className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setPairingCode(null);
                    setSessionId(null);
                    setPhoneNumber('');
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Connect Another
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">⚠️ Important Notes:</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• The pairing code expires in a few minutes, use it immediately</li>
            <li>• Each session is independent and maintains its own connection</li>
            <li>• You can connect multiple numbers by creating new sessions</li>
            <li>• Make sure you have internet connection on both devices</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
