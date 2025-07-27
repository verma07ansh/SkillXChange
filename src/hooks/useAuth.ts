import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '../services/userService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthStateChange = async (user: User | null) => {
      setUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
      await createUserProfile(result.user.uid, {
        name,
        email,
        isProfileComplete: false
      });
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Check if user profile exists, if not create one
      const existingProfile = await getUserProfile(result.user.uid);
      if (!existingProfile) {
        await createUserProfile(result.user.uid, {
          name: result.user.displayName || '',
          email: result.user.email || '',
          isProfileComplete: false
        });
      }
    }
    return result;
  };

  const logout = async () => {
    setUserProfile(null);
    return await signOut(auth);
  };

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        console.log('Refreshed user profile:', profile);
        setUserProfile(profile);
        return profile;
      } catch (error) {
        console.error('Error refreshing user profile:', error);
        throw error;
      }
    }
  };
  
  return {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    refreshUserProfile
  };
};