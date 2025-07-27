import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  location?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  profilePhotoUrl?: string;
  visibility: 'public' | 'private';
  rating: number;
  feedback: Array<{
    from: string;
    fromUserId: string;
    rating: number;
    comment: string;
    createdAt: any;
  }>;
  isBanned: boolean;
  role: 'user' | 'admin';
  contactInfo?: {
    email?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  isProfileComplete: boolean;
  createdAt: any;
  updatedAt: any;
}

export const createUserProfile = async (uid: string, userData: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const defaultData: UserProfile = {
    uid,
    name: userData.name || '',
    email: userData.email || '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: 'Weekends',
    visibility: 'public',
    rating: 0,
    feedback: [],
    isBanned: false,
    role: 'user',
    isProfileComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...userData
  };
  
  await setDoc(userRef, defaultData);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (uid: string, userData: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getPublicUsers = async (excludeUserId?: string): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef, 
    where('visibility', '==', 'public'),
    where('isProfileComplete', '==', true),
    where('isBanned', '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs.map(doc => doc.data() as UserProfile);
  
  // Filter out the current user if excludeUserId is provided
  if (excludeUserId) {
    return users.filter(user => user.uid !== excludeUserId);
  }
  
  return users;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  
  const users = querySnapshot.docs.map(doc => doc.data() as UserProfile);
  
  // Sort by creation date (newest first)
  return users.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};