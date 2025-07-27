import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllConversations, getAllMessages, ChatConversation, ChatMessage } from '../services/chatService';
import Navbar from '../components/Navbar';
import { MessageCircle, Users, Eye, User } from 'lucide-react';

interface AdminChatOverviewPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const AdminChatOverviewPage: React.FC<AdminChatOverviewPageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user, userProfile, loading } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
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
      loadData();
    }
  }, [isAuthorized]);

  const loadData = async () => {
    try {
      const [allConversations, allMessages] = await Promise.all([
        getAllConversations(),
        getAllMessages()
      ]);
      
      setConversations(allConversations);
      
      // Group messages by conversation for easier access
      if (selectedConversation) {
        const conversationMessages = allMessages.filter(msg => msg.chatId === selectedConversation.id);
        setMessages(conversationMessages);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleConversationSelect = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    try {
      const allMessages = await getAllMessages();
      const conversationMessages = allMessages.filter(msg => msg.chatId === conversation.id);
      setMessages(conversationMessages.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(0);
        return aTime.getTime() - bTime.getTime();
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getTotalMessages = (conversationId: string) => {
    return messages.filter(msg => msg.chatId === conversationId).length;
  };

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
        currentPage="admin-chat"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Chat Overview</h1>
            </div>
            <p className="text-green-100 mt-2">
              Monitor all user conversations and messages across the platform.
            </p>
          </div>

          <div className="flex h-[calc(100vh-300px)]">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>All Conversations ({conversations.length})</span>
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-green-50 border-green-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          {conversation.participantPhotos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={conversation.participantNames[index]}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white"
                                loading="eager"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className={`absolute inset-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${photo ? 'hidden' : ''}`}>
                                <img 
                                  src="/user.png" 
                                  alt="Default user" 
                                  className="w-4 h-4 object-contain opacity-60"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.participantNames.join(' & ')}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>{formatTime(conversation.lastMessageTime)}</span>
                            <span className="bg-gray-200 px-2 py-1 rounded-full">
                              {getTotalMessages(conversation.id!)} msgs
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-600 text-sm">
                      User conversations will appear here when they start chatting.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages View */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          Viewing: {selectedConversation.participantNames.join(' & ')}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-600">
                        {messages.length} messages
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => {
                        const senderIndex = selectedConversation.participants.findIndex(id => id === message.senderId);
                        const senderName = selectedConversation.participantNames[senderIndex] || 'Unknown';
                        
                        return (
                          <div key={message.id} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{senderName}</span>
                              <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                            </div>
                            <p className="text-gray-700">{message.message}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                message.isRead ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {message.isRead ? 'Read' : 'Unread'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-16">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages</h3>
                        <p className="text-gray-600">This conversation has no messages yet.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a conversation from the sidebar to view messages.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatOverviewPage;