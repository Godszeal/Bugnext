'use client';

import { useState, useEffect } from 'react';
import { Phone, ArrowLeft, Trash2, RefreshCw, Circle } from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  sessionId: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  lastActive: string;
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions/list');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      fetchSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'pending':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Session Dashboard
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={fetchSessions}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <Link
              href="/connect"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              New Session
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Sessions Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by connecting your first WhatsApp account
            </p>
            <Link
              href="/connect"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              Connect WhatsApp
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Circle className={`w-3 h-3 mr-2 ${getStatusColor(session.status)} fill-current`} />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                      {session.status}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteSession(session.sessionId)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      +{session.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Session ID</p>
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                      {session.sessionId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
