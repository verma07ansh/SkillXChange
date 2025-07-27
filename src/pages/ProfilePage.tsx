import React, { useState, useEffect } from 'react';
import { Camera, Plus, X, Save, MapPin, Clock, Eye, EyeOff, Mail, Linkedin, Github, Globe, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile, UserProfile } from '../services/userService';
import Navbar from '../components/Navbar';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

const IMGBB_API_KEY = 'b8a06f6644d882a9f28c6cec528b5eeb';

interface ProfilePageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { notifications, removeNotification, showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    name: '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: 'Weekends',
    visibility: 'public',
    contactInfo: {
      email: '',
      linkedin: '',
      github: '',
      portfolio: ''
    }
  });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        location: userProfile.location || '',
        skillsOffered: userProfile.skillsOffered || [],
        skillsWanted: userProfile.skillsWanted || [],
        availability: userProfile.availability || 'Weekends',
        visibility: userProfile.visibility || 'public',
        contactInfo: {
          email: userProfile.contactInfo?.email || user?.email || '',
          linkedin: userProfile.contactInfo?.linkedin || '',
          github: userProfile.contactInfo?.github || '',
          portfolio: userProfile.contactInfo?.portfolio || ''
        }
      });
      setPhotoPreview(userProfile.profilePhotoUrl || '');
      setIsEditing(!userProfile.isProfileComplete);
    } else if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.displayName || '',
        contactInfo: {
          ...prev.contactInfo,
          email: user.email || ''
        }
      }));
      setIsEditing(true);
    }
  }, [userProfile, user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToImgbb = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        try {
          const base64 = reader.result?.toString().split(',')[1];
          if (!base64) {
            throw new Error('Failed to convert image to base64');
          }

          const formData = new FormData();
          formData.append('image', base64);

          const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (data?.data?.url) {
            resolve(data.data.url);
          } else {
            throw new Error('Upload failed - no URL returned');
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  const addSkill = (type: 'offered' | 'wanted') => {
    const skill = type === 'offered' ? newSkillOffered : newSkillWanted;
    if (skill.trim()) {
      const skillsKey = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
      setProfileData(prev => ({
        ...prev,
        [skillsKey]: [...(prev[skillsKey] || []), skill.trim()]
      }));
      if (type === 'offered') {
        setNewSkillOffered('');
      } else {
        setNewSkillWanted('');
      }
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', index: number) => {
    const skillsKey = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    setProfileData(prev => ({
      ...prev,
      [skillsKey]: prev[skillsKey]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let photoUrl = userProfile?.profilePhotoUrl;
      
      if (profilePhoto) {
        setUploadingPhoto(true);
        try {
          photoUrl = await uploadImageToImgbb(profilePhoto);
        } catch (photoError) {
          console.error('Error uploading profile photo:', photoError);
          showError('Photo Upload Failed', 'Profile photo upload failed. Please try again or continue without updating the photo.');
          return; // Don't save profile if photo upload fails
        } finally {
          setUploadingPhoto(false);
        }
      }

      const updateData: Partial<UserProfile> = {
        ...profileData,
        isProfileComplete: true
      };

      // Only include profilePhotoUrl if it has a defined value and is not empty
      if (photoUrl && photoUrl.trim() !== '') {
        updateData.profilePhotoUrl = photoUrl;
      }

      await updateUserProfile(user.uid, updateData);
      
      // Immediately refresh the user profile to update local state
      await refreshUserProfile();
      
      showSuccess('Profile Saved!', 'Your profile has been updated successfully.');
      setIsEditing(false);
      setProfilePhoto(null); // Clear the selected photo after save
      
      // Add a small delay to ensure the success notification is visible, then redirect
      setTimeout(() => {
        onNavigateHome();
      }, 500);
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Profile Update Failed', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        showBackButton={true}
        onBackClick={onNavigateHome}
        onHomeClick={onNavigateHome}
        onProfileClick={() => {}} // Already on profile page
        onRequestsClick={() => {}} // Will be handled by App.tsx navigation
        onMessagesClick={() => {}} // Will be handled by App.tsx navigation
        currentPage="profile"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">
                {userProfile?.isProfileComplete ? 'My Profile' : 'Complete Your Profile'}
              </h1>
              {userProfile?.isProfileComplete && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Profile Photo Section */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover" 
                      loading="eager"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                      <img 
                        src="/user.png" 
                        alt="Default user" 
                        className="w-16 h-16 object-contain opacity-60"
                      />
                    </div>
                  )}
                  {photoPreview && (
                    <div className="hidden w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <img 
                      src="/user.png" 
                      alt="Default user" 
                      className="w-16 h-16 object-contain opacity-60"
                    />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingPhoto || loading}
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {uploadingPhoto && (
                <div className="text-sm text-green-600 mt-2 flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <span>Uploading photo...</span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={profileData.name || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="e.g., Mumbai, India"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Availability
                    </label>
                    <select
                      value={profileData.availability || 'Weekends'}
                      onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    >
                      <option value="Weekends">Weekends</option>
                      <option value="Evenings">Evenings</option>
                      <option value="Weekdays">Weekdays</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Skills Offered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Skills Offered</label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {profileData.skillsOffered?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm border border-green-200"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill('offered', index)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkillOffered}
                        onChange={(e) => setNewSkillOffered(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill('offered')}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Add a skill you can teach"
                      />
                      <button
                        onClick={() => addSkill('offered')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Wanted */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Skills Wanted</label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {profileData.skillsWanted?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill('wanted', index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkillWanted}
                        onChange={(e) => setNewSkillWanted(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill('wanted')}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Add a skill you want to learn"
                      />
                      <button
                        onClick={() => addSkill('wanted')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Me</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.contactInfo?.email || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, email: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Linkedin className="w-4 h-4 inline mr-1" />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={profileData.contactInfo?.linkedin || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, linkedin: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Github className="w-4 h-4 inline mr-1" />
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    value={profileData.contactInfo?.github || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, github: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={profileData.contactInfo?.portfolio || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, portfolio: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setProfileData(prev => ({
                    ...prev,
                    visibility: prev.visibility === 'public' ? 'private' : 'public'
                  }))}
                  disabled={!isEditing}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    profileData.visibility === 'public'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
                >
                  {profileData.visibility === 'public' ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  <span>
                    {profileData.visibility === 'public' ? 'Public Profile' : 'Private Profile'}
                  </span>
                </button>
                <p className="text-sm text-gray-600">
                  {profileData.visibility === 'public' 
                    ? 'Your profile is visible to everyone' 
                    : 'Your profile is only visible to you'
                  }
                </p>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
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

export default ProfilePage;