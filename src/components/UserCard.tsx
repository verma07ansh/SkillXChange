import React from 'react';
import { Star, Clock, ArrowRight, User } from 'lucide-react';
import { UserProfile } from '../services/userService';

interface UserCardProps {
  user: UserProfile;
  onRequest: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onRequest }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 shadow-sm">
      <div className="flex items-start space-x-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20">
            {user.profilePhotoUrl ? (
              <>
                <img
                  src={user.profilePhotoUrl}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <img 
                    src="/user.png" 
                    alt="Default user" 
                    className="w-10 h-10 object-contain opacity-60"
                  />
                </div>
              </>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <img 
                  src="/user.png" 
                  alt="Default user" 
                  className="w-10 h-10 object-contain opacity-60"
                />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h3>
          
          {/* Skills Offered */}
          <div className="mb-3">
            <span className="text-sm text-green-600 font-medium">Skills Offered → </span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {user.skillsOffered.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm border border-green-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 font-medium">Skills wanted → </span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {user.skillsWanted.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Ratings</span>
              <div className="flex items-center space-x-1 ml-2">
                {renderStars(user.rating)}
                <span className="text-sm text-gray-700 ml-1">
                  {user.rating.toFixed(1)}/5
                </span>
                <span className="text-sm text-gray-600 ml-1">
                  ({user.feedback.length} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Request Button */}
        <div className="flex-shrink-0">
          <button
            onClick={onRequest}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium"
          >
            Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;