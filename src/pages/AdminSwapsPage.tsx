import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAllRequests, SkillRequest } from '../services/requestService';
import { getUserProfile, UserProfile } from '../services/userService';
import Navbar from '../components/Navbar';

interface AdminSwapsPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

interface RequestWithUsers extends SkillRequest {
  fromUserName: string;
  toUserName: string;
}

const AdminSwapsPage: React.FC<AdminSwapsPageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [requests, setRequests] = useState<RequestWithUsers[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
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

  useEffect(() => {
    if (isAuthorized) {
      loadRequests();
    }
  }, [isAuthorized]);

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const allRequests = await getAllRequests();
      
      // Fetch user names for each request
      const requestsWithUsers = await Promise.all(
        allRequests.map(async (request) => {
          try {
            const [fromUser, toUser] = await Promise.all([
              getUserProfile(request.fromUserId),
              getUserProfile(request.toUserId)
            ]);
            
            return {
              ...request,
              fromUserName: fromUser?.name || 'Unknown User',
              toUserName: toUser?.name || 'Unknown User'
            };
          } catch (error) {
            console.error('Error fetching user data for request:', request.id, error);
            return {
              ...request,
              fromUserName: 'Unknown User',
              toUserName: 'Unknown User'
            };
          }
        })
      );
      
      setRequests(requestsWithUsers);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'border-green-200 bg-green-50';
      case 'rejected': return 'border-red-200 bg-red-50';
      default: return 'border-yellow-200 bg-yellow-50';
    }
  };

  const filteredRequests = requests.filter(request => request.status === activeTab);

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
        onBackClick={onNavigateBack}
        onHomeClick={onNavigateHome}
        onProfileClick={() => {}} // Will be handled by App.tsx navigation
        onRequestsClick={() => {}} // Will be handled by App.tsx navigation
        onMessagesClick={() => {}} // Will be handled by App.tsx navigation
        onAdminClick={onNavigateBack} // Go back to admin dashboard
        currentPage="admin-swaps"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-8 h-8 text-white" />
                <h1 className="text-2xl font-bold text-white">Swap Request Management</h1>
              </div>
              <button
                onClick={loadRequests}
                disabled={loadingRequests}
                className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRequests ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            <p className="text-green-100 mt-2">
              Monitor and manage all skill swap requests across the platform.
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {(['pending', 'accepted', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {getStatusIcon(tab)}
                    <span className="capitalize">{tab}</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {requests.filter(r => r.status === tab).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loadingRequests ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading swap requests...</p>
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${getStatusColor(request.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Main Request Info */}
                        <div className="flex items-center space-x-2 mb-3">
                          {getStatusIcon(request.status)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            <span className="text-blue-600">{request.fromUserName}</span>
                            <span className="text-gray-500 mx-2">offered:</span>
                            <span className="text-green-600">{request.offeredSkill}</span>
                            <span className="text-gray-500 mx-2">→ wanted:</span>
                            <span className="text-purple-600">{request.wantedSkill}</span>
                            <span className="text-gray-500 mx-2">from</span>
                            <span className="text-blue-600">{request.toUserName}</span>
                          </h3>
                        </div>

                        {/* Message */}
                        {request.message && (
                          <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Message:</span> "{request.message}"
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            <strong>Created:</strong> {formatDate(request.createdAt)}
                          </span>
                          {request.updatedAt && request.createdAt !== request.updatedAt && (
                            <span>
                              <strong>Updated:</strong> {formatDate(request.updatedAt)}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">
                  {activeTab === 'pending' ? '⏳' : activeTab === 'accepted' ? '✅' : '❌'}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {activeTab} requests
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' && 'No pending requests at the moment.'}
                  {activeTab === 'accepted' && 'No accepted requests yet.'}
                  {activeTab === 'rejected' && 'No rejected requests yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSwapsPage;