import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Home } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-md w-full px-8 py-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please sign in with the appropriate account.
        </p>
        <div className="flex flex-col space-y-4">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}