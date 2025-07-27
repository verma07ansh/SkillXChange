import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import UserCard from '../components/UserCard';
import { getPublicUsers, UserProfile } from '../services/userService';
import { ChevronLeft, ChevronRight, Search, Code, Users, MessageSquare, Plus, ArrowRight, Star, User } from 'lucide-react';

interface HomePageProps {
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  onNavigateProfile: () => void;
  onNavigateRequests: () => void;
  onNavigateAdmin: () => void;
  onViewUserProfile: (userId: string) => void;
  onNavigateMessages: () => void;
  onNavigateChat: (userId?: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateLogin, onNavigateSignup, onNavigateProfile, onNavigateRequests, onNavigateAdmin, onViewUserProfile, onNavigateMessages, onNavigateChat }) => {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  // Load users from Firestore with optimized loading
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        // Pass current user's ID to exclude them from the results
        const publicUsers = await getPublicUsers(user?.uid);
        setUsers(publicUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [user]); // Add user as dependency to reload when user changes

  // Filter users based on search query and availability
  const filteredUsers = useMemo(() => {
    return users.filter(userItem => {
      // Exclude current user from the list
      if (user && userItem.uid === user.uid) {
        return false;
      }
      
      const matchesSearch = searchQuery === '' || 
        userItem.skillsOffered.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        userItem.skillsWanted.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        userItem.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAvailability = availabilityFilter === 'All' || 
        userItem.availability === availabilityFilter;

      return matchesSearch && matchesAvailability;
    });
  }, [searchQuery, availabilityFilter, users, user]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (availability: string) => {
    setAvailabilityFilter(availability);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleLoginAction = () => {
    onNavigateLogin();
  };

  const handleSignupAction = () => {
    onNavigateSignup();
  };

  const scrollToDiscoverSection = () => {
    const discoverSection = document.getElementById('discover-section');
    if (discoverSection) {
      discoverSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequest = (userId: string) => {
    if (!user) {
      onNavigateLogin();
    } else {
      // Always allow viewing user profile - the messaging check will happen there
      onViewUserProfile(userId);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        onLoginAction={handleLoginAction}
        onSignupAction={handleSignupAction}
        onProfileClick={user ? onNavigateProfile : undefined}
        onRequestsClick={user ? onNavigateRequests : undefined}
        onAdminClick={user && userProfile?.role === 'admin' ? onNavigateAdmin : undefined}
        onMessagesClick={user ? onNavigateMessages : undefined}
        onChatClick={user ? onNavigateChat : undefined}
        onHomeClick={() => {}} // Already on home page
        currentPage="home"
      />

      {/* Hero Section with Floating Cards */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white py-20 overflow-hidden" style={{ backgroundColor: '#ECFDF5' }}>
        {/* Floating Green Balls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Ball 1 */}
          <div 
            className="absolute w-4 h-4 bg-green-200 rounded-full shadow-lg blur-[0.5px] animate-bounce"
            style={{ 
              backgroundColor: '#A7F3D0',
              top: '15%',
              left: '8%',
              animationDelay: '0s',
              animationDuration: '3s'
            }}
          />
          
          {/* Ball 2 */}
          <div 
            className="absolute w-6 h-6 bg-green-200 rounded-full shadow-lg blur-[0.5px] animate-pulse"
            style={{ 
              backgroundColor: '#A7F3D0',
              top: '25%',
              right: '12%',
              animationDelay: '1s',
              animationDuration: '4s'
            }}
          />
          
          {/* Ball 3 */}
          <div 
            className="absolute w-3 h-3 bg-green-200 rounded-full shadow-lg blur-[0.5px] animate-bounce"
            style={{ 
              backgroundColor: '#BBF7D0',
              top: '45%',
              left: '5%',
              animationDelay: '2s',
              animationDuration: '3.5s'
            }}
          />
          
          {/* Ball 4 */}
          <div 
            className="absolute w-5 h-5 bg-green-200 rounded-full shadow-lg blur-[0.5px] animate-pulse"
            style={{ 
              backgroundColor: '#A7F3D0',
              top: '60%',
              right: '8%',
              animationDelay: '0.5s',
              animationDuration: '4.5s'
            }}
          />
          
          {/* Ball 5 */}
          <div 
            className="absolute w-4 h-4 bg-green-200 rounded-full shadow-lg blur-[0.5px] animate-bounce"
            style={{ 
              backgroundColor: '#BBF7D0',
              top: '75%',
              left: '10%',
              animationDelay: '1.5s',
              animationDuration: '3s'
            }}
          />
          
          {/* Ball 6 */}
          <div 
            className="absolute w-6 h-6 bg-green-200 rounded-full shadow-lg blur-[0.5px] animate-pulse"
            style={{ 
              backgroundColor: '#A7F3D0',
              top: '35%',
              right: '25%',
              animationDelay: '2.5s',
              animationDuration: '4s'
            }}
          />
          
          {/* Ball 7 */}
          <div 
            className="absolute w-3 h-3 bg-green-200 rounded-full shadow-lg blur-[0.5px] animate-bounce"
            style={{ 
              backgroundColor: '#BBF7D0',
              top: '80%',
              right: '15%',
              animationDelay: '3s',
              animationDuration: '3.5s'
            }}
          />
        </div>

        {/* Left Floating Card */}
        <div className="absolute left-[10%] top-1/2 transform -translate-y-1/2 -rotate-6 z-10 hidden lg:block">
          <div className="bg-green-50 rounded-xl p-6 shadow-lg border border-green-100 w-64">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Connect with top talent</h3>
            </div>
            <p className="text-sm text-gray-600">
              Find skilled professionals and collaborate on exciting projects
            </p>
          </div>
        </div>

        {/* Right Floating Card */}
        <div className="absolute right-[10%] top-1/2 transform -translate-y-1/2 rotate-6 z-10 hidden lg:block">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 w-64">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Quick Response</h3>
            </div>
            <p className="text-sm text-gray-600">
              Get fast responses from community members and start learning
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              The All-in-One Platform
            </h1>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              for <span className="italic">Skill Swappers</span>, <span className="italic">Learning</span>,
            </h2>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              and <span className="italic">Communities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Showcase your skills, find learning opportunities, join vibrant communities and 
              explore skill exchanges — all in one powerful platform
            </p>
            
            <button
              onClick={user ? scrollToDiscoverSection : onNavigateSignup}
              className="inline-flex items-center px-8 py-4 bg-green-500 text-white text-lg font-semibold rounded-full hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl z-30 relative"
            >
              Get Started →
            </button>
            
            <p className="text-gray-500 mt-4">
              Join our community today and start collaborating!
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Connect & Collaborate Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                <Code className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Connect with top talent and collaborate on exciting projects
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find skilled professionals and work together on innovative projects that make a difference.
              </p>
            </div>

            {/* Quick Response Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Response
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get fast responses from community members and start your skill exchange journey immediately.
              </p>
            </div>

            {/* Community Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Join vibrant communities
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Become part of active communities where learning and skill sharing happen every day.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div id="discover-section" className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Discover Skill Swappers
            </h2>
            <p className="text-xl text-gray-600">
              Connect with talented individuals ready to share their expertise
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center max-w-4xl mx-auto">
            {/* Availability Filter */}
            <div className="relative sm:w-48">
              <select
                value={availabilityFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none"
              >
                <option value="All">Availability</option>
                <option value="Weekends">Weekends</option>
                <option value="Evenings">Evenings</option>
                <option value="Weekdays">Weekdays</option>
              </select>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or skills..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* User Cards Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : paginatedUsers.length > 0 ? (
          <div className="space-y-6 mb-12">
            {paginatedUsers.map(userItem => (
              <UserCard
                key={userItem.uid}
                user={userItem}
                onRequest={() => handleRequest(userItem.uid)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {user ? 'No other users found' : 'No users found'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {user 
                ? 'Try adjusting your search query or filters to find other users to connect with.'
                : 'Please log in to see available users and start connecting with others.'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-green-500 text-white border border-green-500'
                    : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            © 2025 SkillXChange. Connecting learners and experts worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;