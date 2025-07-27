import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import RequestsPage from './pages/RequestsPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSwapsPage from './pages/AdminSwapsPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import MessagesPage from './pages/MessagesPage';
import BannedPage from './pages/BannedPage';
import ChatPage from './pages/ChatPage';
import AdminChatOverviewPage from './pages/AdminChatOverviewPage';

type Page = 'home' | 'login' | 'signup' | 'profile' | 'user-profile' | 'requests' | 'admin' | 'admin-users' | 'admin-swaps' | 'admin-messages' | 'messages' | 'banned' | 'chat' | 'admin-chat';

function App() {
  const { user, userProfile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);

  // Global navigation handlers that work from any page
  const handleNavigateToProfile = () => {
    setCurrentPage('profile');
  };

  const handleNavigateToRequests = () => {
    setCurrentPage('requests');
  };

  const handleNavigateToMessages = () => {
    setCurrentPage('messages');
  };

  const handleNavigateToChat = (userId?: string) => {
    setSelectedChatUserId(userId || null);
    setCurrentPage('chat');
  };

  const handleNavigateToAdmin = () => {
    if (userProfile?.role === 'admin') {
      setCurrentPage('admin');
    }
  };

  const handleNavigateToAdminChat = () => {
    if (userProfile?.role === 'admin') {
      setCurrentPage('admin-chat');
    }
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
  };

  // Handle navigation after authentication changes
  useEffect(() => {
    if (loading) {
      return; // Wait until authentication check is complete
    }

    if (user) {
      // If the user is banned, this is the highest priority. Always show the banned page.
      if (userProfile?.isBanned) {
        setCurrentPage('banned');
        return;
      }
      // If the user's profile is not yet complete, they must be on the profile page.
      if (!userProfile?.isProfileComplete) {
        setCurrentPage('profile');
        return;
      }
    } else {
      // User is not logged in. If they are on a page that requires a login,
      // send them home.
      const protectedPages = ['profile', 'requests', 'messages', 'chat', 'admin', 'admin-users', 'admin-swaps', 'admin-messages', 'admin-chat'];
      if (protectedPages.includes(currentPage)) {
        setCurrentPage('home');
      }
    }
  }, [user, userProfile, loading]); // Notice: currentPage is intentionally omitted here


  // HOOK 2: Handles the specific edge case of a logged-in user being on a guest page.
  useEffect(() => {
    // If the user is fully logged in with a complete profile...
    if (user && userProfile?.isProfileComplete) {
      // ...they should not be on the login or signup pages.
      if (currentPage === 'login' || currentPage === 'signup') {
        setCurrentPage('home');
      }
    }
  }, [currentPage, user, userProfile]);


  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'home' && (
        <HomePage 
          onNavigateLogin={() => setCurrentPage('login')}
          onNavigateSignup={() => setCurrentPage('signup')}
          onNavigateProfile={handleNavigateToProfile}
          onNavigateRequests={handleNavigateToRequests}
          onNavigateAdmin={handleNavigateToAdmin}
          onNavigateMessages={handleNavigateToMessages}
          onNavigateChat={handleNavigateToChat}
          onViewUserProfile={(userId: string) => {
            setSelectedUserId(userId);
            setCurrentPage('user-profile');
          }}
        />
      )}
      {currentPage === 'login' && (
        <LoginPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateSignup={() => setCurrentPage('signup')}
        />
      )}
      {currentPage === 'signup' && (
        <SignupPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateLogin={() => setCurrentPage('login')}
        />
      )}
      {currentPage === 'profile' && (
        <ProfilePage 
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={handleNavigateToHome}
        />
      )}
      {currentPage === 'user-profile' && selectedUserId && (
        <UserProfilePage 
          userId={selectedUserId}
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={handleNavigateToHome}
          onNavigateMessages={handleNavigateToMessages}
          onNavigateChat={handleNavigateToChat}
        />
      )}
      {currentPage === 'requests' && (
        <RequestsPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={handleNavigateToHome}
        />
      )}
      {currentPage === 'admin' && (
        <AdminPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateUsers={() => setCurrentPage('admin-users')}
          onNavigateSwaps={() => setCurrentPage('admin-swaps')}
          onNavigateMessages={() => setCurrentPage('admin-messages')}
          onNavigateChat={handleNavigateToAdminChat}
        />
      )}
      {currentPage === 'admin-users' && (
        <AdminUsersPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={() => setCurrentPage('admin')}
        />
      )}
      {currentPage === 'admin-swaps' && (
        <AdminSwapsPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={() => setCurrentPage('admin')}
        />
      )}
      {currentPage === 'admin-messages' && (
        <AdminMessagesPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={() => setCurrentPage('admin')}
        />
      )}
      {currentPage === 'messages' && (
        <MessagesPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={handleNavigateToHome}
        />
      )}
      {currentPage === 'banned' && (
        <BannedPage />
      )}
      {currentPage === 'chat' && (
        <ChatPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={handleNavigateToHome}
          selectedUserId={selectedChatUserId}
        />
      )}
      {currentPage === 'admin-chat' && (
        <AdminChatOverviewPage 
          onNavigateHome={handleNavigateToHome}
          onNavigateBack={() => setCurrentPage('admin')}
        />
      )}
    </>
  );
}

export default App;