import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { markMessageAsSeen } from '../services/messageService';
import Navbar from '../components/Navbar';
import { MessageCircle, AlertCircle, Clock } from 'lucide-react';

interface MessagesPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user } = useAuth();
  const { messages, loading: messagesLoading } = useMessages();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
      
      // Mark messages as seen when user views them
      messages.forEach(async (message) => {
        if (message.id && !message.seenBy.includes(user.uid)) {
          try {
            await markMessageAsSeen(message.id, user.uid);
          } catch (error) {
            console.error('Error marking message as seen:', error);
          }
        }
      });
    }
  }, [user, messages]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getMessageBorderColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-500';
      case 'urgent':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          showBackButton={true}
          onBackClick={onNavigateBack}
          onHomeClick={onNavigateHome}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Please Log In</h2>
            <p className="text-gray-600">You need to be logged in to view messages.</p>
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
        onRequestsClick={() => {}} // Will be handled by App.tsx navigation
        onMessagesClick={() => {}} // Already on messages page
        currentPage="messages"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg mb-6 text-white">
            <div className="p-8">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-3xl font-bold">Platform Messages</h1>
                  <p className="text-green-100 mt-1">Important updates and announcements from the platform team.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Content */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-8">
              {loading || messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No messages sent yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Platform announcements will appear here when available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <MessageCircle className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-green-600">Platform Announcement</h3>
                            </div>
                            <p className="text-gray-900 text-base mb-4 leading-relaxed">{message.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {message.createdAt ? new Date(message.createdAt.toDate()).toLocaleDateString() + ' at ' + new Date(message.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </span>
                              </div>
                              <span>•</span>
                              <span>{message.seenBy.length} users seen</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;