import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getUserConversations, 
  getChatMessages, 
  sendMessage, 
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToConversations,
  ChatConversation, 
  ChatMessage 
} from '../services/chatService';
import Navbar from '../components/Navbar';
import { Send, User, MessageCircle } from 'lucide-react';

interface ChatPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
  selectedUserId?: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ onNavigateHome, onNavigateBack, selectedUserId }) => {
  const { user, userProfile } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    console.log('ChatPage - Loading conversations for user:', user.uid);
    console.log('ChatPage - selectedUserId:', selectedUserId);
    
    const unsubscribe = subscribeToConversations(user.uid, (newConversations) => {
      console.log('ChatPage - Received conversations:', newConversations.length);
      setConversations(newConversations);
      setLoading(false);
      
      // Auto-select conversation if selectedUserId is provided
      if (selectedUserId && newConversations.length > 0) {
        console.log('ChatPage - Looking for conversation with user:', selectedUserId);
        const targetConversation = newConversations.find(conv => 
          conv.participants.includes(selectedUserId)
        );
        if (targetConversation) {
          console.log('ChatPage - Found target conversation:', targetConversation.id);
          setSelectedConversation(targetConversation);
        } else {
          console.log('ChatPage - No conversation found with user:', selectedUserId);
          // If no conversation found but selectedUserId is provided, 
          // it might be a newly created conversation that hasn't loaded yet
          // Let's wait a bit and try again
          setTimeout(() => {
            const retryConversation = newConversations.find(conv => 
              conv.participants.includes(selectedUserId)
            );
            if (retryConversation) {
              console.log('ChatPage - Found conversation on retry:', retryConversation.id);
              setSelectedConversation(retryConversation);
            }
          }, 1000);
        }
      } else if (selectedUserId && newConversations.length === 0) {
        console.log('ChatPage - No conversations loaded yet, waiting...');
        // If selectedUserId is provided but no conversations loaded yet,
        // the conversation might be newly created and still loading
      }
    });

    return unsubscribe;
  }, [user, selectedUserId]);

  // Additional effect to handle conversation selection when conversations update
  useEffect(() => {
    if (selectedUserId && conversations.length > 0 && !selectedConversation) {
      console.log('ChatPage - Attempting to select conversation after conversations loaded');
      const targetConversation = conversations.find(conv => 
        conv.participants.includes(selectedUserId)
      );
      if (targetConversation) {
        console.log('ChatPage - Selecting conversation:', targetConversation.id);
        setSelectedConversation(targetConversation);
      }
    }
  }, [conversations, selectedUserId, selectedConversation]);

  // Remove the old useEffect that was duplicating this logic
  /*
  useEffect(() => {
    if (!user) return;

    console.log('ChatPage - Loading conversations for user:', user.uid);
    
    const unsubscribe = subscribeToConversations(user.uid, (newConversations) => {
      console.log('ChatPage - Received conversations:', newConversations.length);
      setConversations(newConversations);
      setLoading(false);
      
      // Auto-select conversation if selectedUserId is provided
      if (selectedUserId && newConversations.length > 0) {
        console.log('ChatPage - Looking for conversation with user:', selectedUserId);
        const targetConversation = newConversations.find(conv => 
          conv.participants.includes(selectedUserId)
        );
        if (targetConversation) {
          console.log('ChatPage - Found target conversation:', targetConversation.id);
          setSelectedConversation(targetConversation);
        } else {
          console.log('ChatPage - No conversation found with user:', selectedUserId);
        }
      }
    });

    return unsubscribe;
  */

  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = subscribeToMessages(selectedConversation.id!, (newMessages) => {
      setMessages(newMessages);
      
      // Mark messages as read when viewing
      if (user && newMessages.length > 0) {
        markMessagesAsRead(selectedConversation.id!, user.uid);
      }
    });

    return unsubscribe;
  }, [selectedConversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user || !userProfile) return;

    setSendingMessage(true);
    try {
      const otherUserId = selectedConversation.participants.find(id => id !== user.uid)!;
      
      await sendMessage(
        selectedConversation.id!,
        user.uid,
        userProfile.name,
        userProfile.profilePhotoUrl || '',
        newMessage,
        otherUserId
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const getOtherUserInfo = (conversation: ChatConversation) => {
    if (!user) return { name: 'Unknown', photo: '' };
    
    const otherUserIndex = conversation.participants.findIndex(id => id !== user.uid);
    return {
      name: conversation.participantNames[otherUserIndex] || 'Unknown',
      photo: conversation.participantPhotos[otherUserIndex] || ''
    };
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === new Date(today.getTime() - 86400000).toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
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
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
            <p className="text-gray-600">You need to be logged in to access messages.</p>
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
        currentPage="chat"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation) => {
                    const otherUser = getOtherUserInfo(conversation);
                    const unreadCount = conversation.unreadCount[user.uid] || 0;
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="relative">
  {otherUser.photo ? (
    <>
      <img
        src={otherUser.photo}
        alt={otherUser.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
        loading="eager"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden absolute inset-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        <img 
          src="/user.png" 
          alt="Default user" 
          className="w-6 h-6 object-contain opacity-60"
        />
      </div>
    </>
  ) : (
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
      <img 
        src="/user.png" 
        alt="Default user" 
        className="w-6 h-6 object-contain opacity-60"
      />
    </div>
  )}
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</div>
                          </div>

                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{otherUser.name}</h3>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessageTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })) : (
                  <div className="text-center py-16">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-600 text-sm">
                      Start chatting with users after your skill swap requests are accepted.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10">
                        {getOtherUserInfo(selectedConversation).photo ? (
                          <>
                            <img
                              src={getOtherUserInfo(selectedConversation).photo}
                              alt={getOtherUserInfo(selectedConversation).name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                              loading="eager"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                              <img 
                                src="/user.png" 
                                alt="Default user" 
                                className="w-5 h-5 object-contain opacity-60"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                            <img 
                              src="/user.png" 
                              alt="Default user" 
                              className="w-5 h-5 object-contain opacity-60"
                            />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherUserInfo(selectedConversation).name}
                      </h3>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => {
                      const isOwnMessage = message.senderId === user.uid;
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1]?.timestamp) !== formatDate(message.timestamp);
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center text-xs text-gray-500 my-4">
                              {formatDate(message.timestamp)}
                            </div>
                          )}
                          
                          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-green-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {sendingMessage ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a contact from the sidebar to start chatting.</p>
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

export default ChatPage;