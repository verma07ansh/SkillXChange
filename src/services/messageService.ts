import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  arrayUnion,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AdminMessage {
  id?: string;
  title?: string;
  content?: string;
  type?: 'info' | 'warning' | 'urgent';
  message: string;
  createdAt: any;
  createdBy?: string;
  seenBy: string[];
}

export const createAdminMessage = async (message: string): Promise<void> => {
  const messagesRef = collection(db, 'adminMessages');
  await addDoc(messagesRef, {
    message: message.trim(),
    createdAt: serverTimestamp(),
    seenBy: []
  });
};

export const getAllAdminMessages = async (): Promise<AdminMessage[]> => {
  const messagesRef = collection(db, 'adminMessages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as AdminMessage));
};

export const markMessageAsSeen = async (messageId: string, userId: string): Promise<void> => {
  const messageRef = doc(db, 'adminMessages', messageId);
  await updateDoc(messageRef, {
    seenBy: arrayUnion(userId)
  });
};

export const subscribeToAdminMessages = (callback: (messages: AdminMessage[]) => void): Unsubscribe => {
  const messagesRef = collection(db, 'adminMessages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AdminMessage));
    
    callback(messages);
  });
};