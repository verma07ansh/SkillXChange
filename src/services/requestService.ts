import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  and
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { createChatConversation, getChatConversation } from './chatService';
import { getUserProfile } from './userService';

export interface SkillRequest {
  id?: string;
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto: string;
  toUserId: string;
  toUserName: string;
  offeredSkill: string;
  wantedSkill: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  updatedAt: any;
  isRead?: boolean;
}

export const createRequest = async (requestData: Omit<SkillRequest, 'id' | 'createdAt' | 'updatedAt' | 'isRead'>): Promise<void> => {
  const requestsRef = collection(db, 'requests');
  await addDoc(requestsRef, {
    ...requestData,
    isRead: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getReceivedRequests = async (userId: string): Promise<SkillRequest[]> => {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    where('toUserId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const requests = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SkillRequest));
  
  // Sort by createdAt in JavaScript instead of Firestore
  return requests.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};

export const getSentRequests = async (userId: string): Promise<SkillRequest[]> => {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const requests = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SkillRequest));
  
  // Sort by createdAt in JavaScript instead of Firestore
  return requests.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};

export const updateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  console.log('Updating request status to:', status, 'for request:', requestId);
  
  // If accepting the request, create a chat conversation
  if (status === 'accepted') {
    try {
      // Get the request details first using the document ID
      const requestRef = doc(db, 'requests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (requestDoc.exists()) {
        const requestData = requestDoc.data() as SkillRequest;
        console.log('Creating chat for accepted request:', requestData);
        
        // Check if chat conversation already exists
        const existingChat = await getChatConversation(requestData.fromUserId, requestData.toUserId);
        console.log('Existing chat found:', !!existingChat);
        
        if (!existingChat) {
          // Get user profiles for chat creation
          const [fromUser, toUser] = await Promise.all([
            getUserProfile(requestData.fromUserId),
            getUserProfile(requestData.toUserId)
          ]);
          
          console.log('User profiles loaded:', { fromUser: fromUser?.name, toUser: toUser?.name });
          
          if (fromUser && toUser) {
            const chatId = await createChatConversation(
              requestData.fromUserId,
              fromUser.name,
              fromUser.profilePhotoUrl || '',
              requestData.toUserId,
              toUser.name,
              toUser.profilePhotoUrl || ''
            );
            
            console.log('Chat conversation created successfully between', fromUser.name, 'and', toUser.name, 'with ID:', chatId);
          } else {
            console.error('Could not find user profiles for chat creation');
          }
        } else {
          console.log('Chat conversation already exists');
        }
      } else {
        console.error('Request document not found:', requestId);
      }
    } catch (error) {
      console.error('Error creating chat conversation:', error);
      // Don't fail the request update if chat creation fails
    }
  }
  
  // Update the request status
  const requestRef = doc(db, 'requests', requestId);
  
  try {
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp()
    });
    console.log('Request status updated successfully to:', status);
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

export const markRequestAsRead = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    isRead: true,
    updatedAt: serverTimestamp()
  });
};

export const hasAcceptedRequest = async (fromUserId: string, toUserId: string): Promise<boolean> => {
  const requestsRef = collection(db, 'requests');
  
  try {
    // Check both directions - either user could have initiated the request
    const q1 = query(
      requestsRef,
      and(
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId),
        where('status', '==', 'accepted')
      )
    );
    
    const q2 = query(
      requestsRef,
      and(
        where('fromUserId', '==', toUserId),
        where('toUserId', '==', fromUserId),
        where('status', '==', 'accepted')
      )
    );
    
    const [querySnapshot1, querySnapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    const hasAccepted = !querySnapshot1.empty || !querySnapshot2.empty;
    console.log('hasAcceptedRequest check:', { fromUserId, toUserId, hasAccepted });
    return hasAccepted;
  } catch (error) {
    console.error('Error checking accepted request:', error);
    return false;
  }
};

export const getAllRequests = async (): Promise<SkillRequest[]> => {
  const requestsRef = collection(db, 'requests');
  const querySnapshot = await getDocs(requestsRef);
  
  const requests = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SkillRequest));
  
  // Sort by createdAt in JavaScript instead of Firestore
  return requests.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};

export const subscribeToRequests = (userId: string, callback: (requests: SkillRequest[]) => void): Unsubscribe => {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    where('toUserId', '==', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    let requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SkillRequest));
    
    // Sort by createdAt in JavaScript instead of Firestore
    requests = requests.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    callback(requests);
  });
};