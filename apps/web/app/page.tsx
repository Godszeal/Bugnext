'use client';

import { useState } from 'react';
import { Phone, Plus, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Phone className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                WhatsApp Multi-Session Bot
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Activity className="inline w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your WhatsApp
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage multiple WhatsApp sessions with ease. Connect your device using a pairing code
            and start automating your WhatsApp messages.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Plus className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                New Connection
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create a new WhatsApp session by entering your phone number and receiving a pairing code.
            </p>
            <Link
              href="/connect"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
            >
              Connect WhatsApp
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Activity className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Sessions
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              View and manage all your active WhatsApp sessions from a central dashboard.
            </p>
            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Features</h3>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Multi-Session Support:</strong> Connect multiple WhatsApp numbers simultaneously</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Pairing Code Authentication:</strong> No need to scan QR codes, just enter a simple code</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Real-Time Dashboard:</strong> Monitor all your sessions and their status in real-time</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Responsive Design:</strong> Works seamlessly on desktop, tablet, and mobile devices</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Automated Message Handling:</strong> Process incoming messages with custom logic</span>
            </li>
          </ul>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            WhatsApp Multi-Session Bot &copy; 2025 | Built with Next.js 15 & Baileys
          </p>
        </div>
      </footer>
    </div>
  );
}
