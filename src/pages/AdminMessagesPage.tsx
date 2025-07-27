import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createAdminMessage } from '../services/messageService';
import { useNotification } from '../hooks/useNotification';
import Navbar from '../components/Navbar';
import Notification from '../components/Notification';
import { Send, MessageCircle } from 'lucide-react';

interface AdminMessagesPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const AdminMessagesPage: React.FC<AdminMessagesPageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user, userProfile } = useAuth();
  const { notifications, removeNotification, showSuccess, showError } = useNotification();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      await createAdminMessage(newMessage.trim());
      setNewMessage('');
      showSuccess('Message Sent!', 'Your platform message has been sent to all users.');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Send Failed', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Check if user is admin
  if (!user || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          showBackButton={true}
          onBackClick={onNavigateBack}
          onHomeClick={onNavigateHome}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
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
        onMessagesClick={() => {}} // Will be handled by App.tsx navigation
        onAdminClick={onNavigateBack} // Go back to admin dashboard
        currentPage="admin-messages"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Send Platform Message</h1>
                  <p className="text-green-100 mt-1">Send announcements to all platform users</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Compose Message</h2>
                <p className="text-gray-600 text-sm">
                  This message will be visible to all users in their messages section.
                </p>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-6">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <textarea
                    id="message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Enter your platform announcement here..."
                    disabled={sending}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {newMessage.length}/500 characters
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onNavigateBack}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
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

export default AdminMessagesPage;
