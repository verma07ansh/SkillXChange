import React, { useState, useEffect } from 'react';
import { Shield, Users, ArrowRight, Home, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

interface AdminPageProps {
  onNavigateHome: () => void;
  onNavigateUsers: () => void;
  onNavigateSwaps: () => void;
  onNavigateMessages: () => void;
  onNavigateChat: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigateHome, onNavigateUsers, onNavigateSwaps, onNavigateMessages, onNavigateChat }) => {
  const { user, userProfile, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return;
      
      if (!user || !userProfile) {
        onNavigateHome();
        return;
      }

      if (userProfile.role !== 'admin') {
        onNavigateHome();
        return;
      }

      setIsAuthorized(true);
      setCheckingAuth(false);
    };

    checkAdminAccess();
  }, [user, userProfile, loading, onNavigateHome]);

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        showBackButton={true}
        onBackClick={onNavigateHome}
        onHomeClick={onNavigateHome}
        onProfileClick={() => {}} // Will be handled by App.tsx navigation
        onRequestsClick={() => {}} // Will be handled by App.tsx navigation
        onMessagesClick={() => {}} // Will be handled by App.tsx navigation
        currentPage="admin"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-green-100 mt-2">
              Welcome, {userProfile?.name}. Manage the platform from here.
            </p>
          </div>

          {/* Dashboard Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Users Management */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  Manage user accounts, view profiles, and handle user moderation.
                </p>
                <button
                  onClick={onNavigateUsers}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Manage Users
                </button>
              </div>

              {/* Swaps Management */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <ArrowRight className="w-8 h-8 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Swaps</h2>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  Monitor skill swap requests and manage platform activity.
                </p>
                <button
                  onClick={onNavigateSwaps}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Manage Swaps
                </button>
              </div>

              {/* Messages Management */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-8 h-8 text-yellow-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                  </div>
                  <ArrowRight className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  Send platform-wide announcements and updates to all users.
                </p>
                <button
                  onClick={onNavigateMessages}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                >
                  Send Messages
                </button>
              </div>

              {/* Chat Overview */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Chat Overview</h2>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  Monitor all user conversations and direct messages on the platform.
                </p>
                <button
                  onClick={onNavigateChat}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  View Chats
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Admin</div>
                  <div className="text-sm text-gray-600">Current Role</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <div className="text-sm text-gray-600">Platform Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Live</div>
                  <div className="text-sm text-gray-600">System Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Monitor</div>
                  <div className="text-sm text-gray-600">Chat Oversight</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;