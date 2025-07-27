import React, { useState, useEffect } from 'react';
import { User, LogIn, Home, LogOut, ArrowLeft, Bell, CheckCircle, MessageSquare, MessageCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRequests } from '../hooks/useRequests';
import { useMessages } from '../hooks/useMessages';
import { useChat } from '../hooks/useChat';

interface NavbarProps {
  onLoginAction?: () => void;
  onSignupAction?: () => void;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onRequestsClick?: () => void;
  onAdminClick?: () => void;
  onMessagesClick?: () => void;
  onChatClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  currentPage?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onLoginAction,
  onSignupAction,
  showHomeButton, 
  onHomeClick, 
  onProfileClick,
  onRequestsClick,
  onAdminClick,
  onMessagesClick,
  onChatClick,
  showBackButton,
  onBackClick,
  currentPage
}) => {
  const { user, userProfile, logout } = useAuth();
  const { unreadCount } = useRequests();
  const { unreadCount: unreadMessagesCount } = useMessages();
  const { unreadCount: unreadChatCount } = useChat();
  const [showBellNotification, setShowBellNotification] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show bell notification when there are new unread requests
  useEffect(() => {
    if (unreadCount > 0) {
      setShowBellNotification(true);
      const timer = setTimeout(() => {
        setShowBellNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close mobile menu when clicking outside or on navigation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMobileNavClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/70 backdrop-blur-sm shadow-lg border-b border-gray-200/30' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Back button and Logo */}
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              {showBackButton && onBackClick && (
                <button
                  onClick={onBackClick}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              
              {/* Brand Image */}
              <div className="flex items-center">
                <button
                  onClick={() => {
                    // Always navigate to home when clicking logo, regardless of current page
                    if (onHomeClick) {
                      onHomeClick();
                    }
                  }}
                  className="hover:opacity-80 transition-opacity duration-200 flex items-center"
                >
                  <img 
                    src="/skillxchange-removebg-preview.png" 
                    alt="SkillXChange" 
                    className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain"
                    style={{ maxWidth: '280px', maxHeight: '3.5rem' }}
                  />
                </button>
              </div>
            </div>

            {/* Center Navigation - Desktop Only */}
            {user && (
              <div className="hidden lg:flex items-center space-x-1">
                {/* Admin Button */}
                {onAdminClick && userProfile?.role === 'admin' && (
                  <button
                    onClick={onAdminClick}
                    className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    Admin
                  </button>
                )}
                
                {/* Requests */}
                {onRequestsClick && (
                  <button
                    onClick={onRequestsClick}
                    className="relative px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span>Requests</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    
                    {/* Bell notification popup */}
                    {showBellNotification && unreadCount > 0 && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-64 z-50 animate-slide-in">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">New Request!</p>
                            <p className="text-xs text-gray-600">
                              You have {unreadCount} new skill swap request{unreadCount > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                )}
                
                {/* Messages */}
                {onMessagesClick && (
                  <button
                    onClick={onMessagesClick}
                    className="relative px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Messages</span>
                    </div>
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </button>
                )}
                
                {/* Chat */}
                {onChatClick && (
                  <button
                    onClick={onChatClick}
                    className="relative px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                    title="Chat with connected users"
                  >
                    <div className="flex items-center space-x-2">
                      <img src="/chatting.png" alt="Chat" className="w-4 h-4" />
                      <span>Chats</span>
                    </div>
                    {unreadChatCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Right side - Authentication & Profile */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Desktop Profile & Logout */}
                  <div className="hidden sm:flex items-center space-x-3">
                    {/* Profile */}
                    {onProfileClick && (
                      <button
                        onClick={onProfileClick}
                        className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200"
                      >
                        <div className="relative w-8 h-8">
                          {userProfile?.profilePhotoUrl ? (
                            <img
                              src={userProfile.profilePhotoUrl}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                              loading="eager"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 ${userProfile?.profilePhotoUrl ? 'hidden' : ''}`}>
                            <img 
                              src="/user.png" 
                              alt="Default user" 
                              className="w-4 h-4 object-contain opacity-60"
                            />
                          </div>
                        </div>
                        <span className="text-gray-900 font-medium text-sm">
                          {userProfile?.name || user.displayName || user.email}
                        </span>
                      </button>
                    )}
                    
                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-sm flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="mobile-menu-button lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                    aria-label="Toggle mobile menu"
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </>
              ) : showHomeButton ? (
                <button
                  onClick={onHomeClick || (() => {})}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onLoginAction || (() => {})}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={onSignupAction || (() => {})}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {user && isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="mobile-menu fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Profile Section */}
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="relative w-10 h-10">
                  {userProfile?.profilePhotoUrl ? (
                    <img
                      src={userProfile.profilePhotoUrl}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      loading="eager"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 ${userProfile?.profilePhotoUrl ? 'hidden' : ''}`}>
                    <img 
                      src="/user.png" 
                      alt="Default user" 
                      className="w-5 h-5 object-contain opacity-60"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {userProfile?.name || user.displayName || user.email}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-2">
                {onProfileClick && (
                  <button
                    onClick={() => handleMobileNavClick(onProfileClick)}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </button>
                )}

                {onAdminClick && userProfile?.role === 'admin' && (
                  <button
                    onClick={() => handleMobileNavClick(onAdminClick)}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </button>
                )}

                {onRequestsClick && (
                  <button
                    onClick={() => handleMobileNavClick(onRequestsClick)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5" />
                      <span className="font-medium">Requests</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                )}

                {onMessagesClick && (
                  <button
                    onClick={() => handleMobileNavClick(onMessagesClick)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">Messages</span>
                    </div>
                    {unreadMessagesCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </button>
                )}

                {onChatClick && (
                  <button
                    onClick={() => handleMobileNavClick(onChatClick)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <img src="/chatting.png" alt="Chat" className="w-5 h-5" />
                      <span className="font-medium">Chat</span>
                    </div>
                    {unreadChatCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Mobile Logout */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;