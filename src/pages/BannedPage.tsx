import React from 'react';
import { Ban, Mail, Home } from 'lucide-react';

const BannedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-center">
          <Ban className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Account Suspended</h1>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              You are banned from using this platform
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your account has been suspended due to a violation of our community guidelines or terms of service. 
              You are currently unable to access platform features.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">What can you do?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Review our community guidelines</li>
              <li>• Contact support for more information</li>
              <li>• Appeal the decision if you believe it's incorrect</li>
            </ul>
          </div>

          <div className="space-y-3">
            <a
              href="mailto:support@skillswap.com"
              className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Support</span>
            </a>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Return to Homepage</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact our support team with your account details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;