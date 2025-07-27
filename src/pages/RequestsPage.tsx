import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Clock, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getReceivedRequests, getSentRequests, updateRequestStatus, markRequestAsRead, SkillRequest } from '../services/requestService';
import Navbar from '../components/Navbar';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

interface RequestsPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const RequestsPage: React.FC<RequestsPageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user } = useAuth();
  const { notifications, removeNotification, showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<SkillRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadRequests = async () => {
      try {
        const [received, sent] = await Promise.all([
          getReceivedRequests(user.uid),
          getSentRequests(user.uid)
        ]);
        setReceivedRequests(received);
        setSentRequests(sent);
      } catch (error) {
        console.error('Error loading requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user]);

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    setProcessingRequest(requestId);
    try {
      await updateRequestStatus(requestId, action);
      await markRequestAsRead(requestId);
      
      // Update local state
      setReceivedRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: action, isRead: true }
            : req
        )
      );

      // Show success message
      const actionText = action === 'accepted' ? 'accepted' : 'rejected';
      showSuccess(
        `Request ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}!`, 
        `The request has been ${actionText}. ${action === 'accepted' ? 'You can now message each other!' : 'The other user will be notified.'}`
      );
    } catch (error) {
      console.error('Error updating request:', error);
      showError('Update Failed', 'Failed to update request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          showHomeButton={true}
          onHomeClick={onNavigateHome}
        />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
            <p className="text-gray-600">You need to be logged in to view requests.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        showBackButton={true}
        onBackClick={onNavigateBack}
        onHomeClick={onNavigateHome}
        onProfileClick={() => {}} // Will be handled by App.tsx navigation
        onRequestsClick={() => {}} // Already on requests page
        onMessagesClick={() => {}} // Will be handled by App.tsx navigation
        currentPage="requests"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Skill Swap Requests</h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('received')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'received'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Received Requests ({receivedRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'sent'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sent Requests ({sentRequests.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading requests...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === 'received' ? (
                  receivedRequests.length > 0 ? (
                    receivedRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <img
                              src={request.fromUserPhoto}
                              alt={request.fromUserName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                              loading="eager"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className={`absolute inset-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${request.fromUserPhoto ? 'hidden' : ''}`}>
                              <img 
                                src="/user.png" 
                                alt="Default user" 
                                className="w-6 h-6 object-contain opacity-60"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{request.fromUserName}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                                  {getStatusIcon(request.status)}
                                  <span className="capitalize">{request.status}</span>
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Offers:</span> {request.offeredSkill} → 
                                <span className="font-medium"> Wants:</span> {request.wantedSkill}
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                                <div className="flex items-start space-x-2">
                                  <MessageCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-gray-700">{request.message}</p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          
                          {request.status === 'pending' && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleRequestAction(request.id!, 'accepted')}
                                disabled={processingRequest === request.id}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                              >
                                <Check className="w-4 h-4" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleRequestAction(request.id!, 'rejected')}
                                disabled={processingRequest === request.id}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-gray-400 text-6xl mb-4">📥</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests received</h3>
                      <p className="text-gray-600">When others send you skill swap requests, they'll appear here.</p>
                    </div>
                  )
                ) : (
                  sentRequests.length > 0 ? (
                    sentRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <img
                            src={request.fromUserPhoto || '/user.png'}
                            alt="Your profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/user.png';
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">Request to {request.toUserName}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                <span className="capitalize">{request.status}</span>
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">You offered:</span> {request.offeredSkill} → 
                              <span className="font-medium"> You wanted:</span> {request.wantedSkill}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 mb-2">
                              <div className="flex items-start space-x-2">
                                <MessageCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-700">{request.message}</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-gray-400 text-6xl mb-4">📤</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests sent</h3>
                      <p className="text-gray-600">Start connecting with others by sending skill swap requests!</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default RequestsPage;