import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Ban, Star, MapPin, Clock, Eye, EyeOff, Shield, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, updateUserProfile, UserProfile } from '../services/userService';
import Navbar from '../components/Navbar';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

interface AdminUsersPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user, userProfile, loading } = useAuth();
  const { notifications, removeNotification, showSuccess, showError } = useNotification();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [banningUser, setBanningUser] = useState<string | null>(null);
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
      loadUsers();
    }
  }, [isAuthorized]);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Load Failed', 'Failed to load users. Please try again.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleBanUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to ban ${userName}? This action will prevent them from using the platform.`)) {
      return;
    }

    setBanningUser(userId);
    try {
      await updateUserProfile(userId, { isBanned: true });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.uid === userId ? { ...u, isBanned: true } : u
      ));

      showSuccess('User Banned', `${userName} has been banned from the platform.`);
    } catch (error) {
      console.error('Error banning user:', error);
      showError('Ban Failed', 'Failed to ban user. Please try again.');
    } finally {
      setBanningUser(null);
    }
  };

  const handleUnbanUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to unban ${userName}?`)) {
      return;
    }

    setBanningUser(userId);
    try {
      await updateUserProfile(userId, { isBanned: false });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.uid === userId ? { ...u, isBanned: false } : u
      ));

      showSuccess('User Unbanned', `${userName} has been unbanned and can now use the platform.`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      showError('Unban Failed', 'Failed to unban user. Please try again.');
    } finally {
      setBanningUser(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
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
        onAdminClick={onNavigateBack} // Go back to admin dashboard
        currentPage="admin-users"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">User Management</h1>
            </div>
            <p className="text-green-100 mt-2">
              Manage all platform users, view profiles, and handle moderation.
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {loadingUsers ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Users ({users.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {users.map((userItem) => (
                    <div
                      key={userItem.uid}
                      className={`border rounded-lg p-6 transition-all duration-200 ${
                        userItem.isBanned 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Profile Photo */}
                        <div className="flex-shrink-0">
                          <div className="relative w-16 h-16">
                            {userItem.profilePhotoUrl ? (
                              <>
                                <img
                                  src={userItem.profilePhotoUrl}
                                  alt={userItem.name}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                                  loading="eager"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                                  <img 
                                    src="/user.png" 
                                    alt="Default user" 
                                    className="w-8 h-8 object-contain opacity-60"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                                <img 
                                  src="/user.png" 
                                  alt="Default user" 
                                  className="w-8 h-8 object-contain opacity-60"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {userItem.name}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {userItem.role === 'admin' ? (
                                <Shield className="w-4 h-4 text-green-500" />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                userItem.role === 'admin' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {userItem.role}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <p><strong>Email:</strong> {userItem.email}</p>
                            {userItem.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{userItem.location}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{userItem.availability}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {userItem.visibility === 'public' ? (
                                <Eye className="w-3 h-3" />
                              ) : (
                                <EyeOff className="w-3 h-3" />
                              )}
                              <span className="capitalize">{userItem.visibility}</span>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex items-center space-x-1">
                              {renderStars(userItem.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {userItem.rating.toFixed(1)} ({userItem.feedback.length} reviews)
                            </span>
                          </div>

                          {/* Skills */}
                          <div className="space-y-2 mb-4">
                            {userItem.skillsOffered.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-green-600">Offers: </span>
                                <div className="inline-flex flex-wrap gap-1">
                                  {userItem.skillsOffered.slice(0, 3).map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {userItem.skillsOffered.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{userItem.skillsOffered.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {userItem.skillsWanted.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-blue-600">Wants: </span>
                                <div className="inline-flex flex-wrap gap-1">
                                  {userItem.skillsWanted.slice(0, 3).map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {userItem.skillsWanted.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{userItem.skillsWanted.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Ban Status & Actions */}
                          <div className="flex items-center justify-between">
                            {userItem.isBanned ? (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                Banned
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Active
                              </span>
                            )}

                            {/* Don't allow banning self */}
                            {userItem.uid !== user?.uid && (
                              <button
                                onClick={() => userItem.isBanned 
                                  ? handleUnbanUser(userItem.uid, userItem.name)
                                  : handleBanUser(userItem.uid, userItem.name)
                                }
                                disabled={banningUser === userItem.uid}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 ${
                                  userItem.isBanned
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                              >
                                {banningUser === userItem.uid ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-4 h-4" />
                                    <span>{userItem.isBanned ? 'Unban' : 'Ban'} User</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">No users are currently registered on the platform.</p>
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

export default AdminUsersPage;