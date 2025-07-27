import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  and,
  or,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  timestamp: any;
  isRead: boolean;
}

export interface ChatConversation {
  id?: string;
  participants: string[];
  participantNames: string[];
  participantPhotos: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSender?: string;
  unreadCount: { [userId: string]: number };
  createdAt: any;
  updatedAt: any;
}

export const createChatConversation = async (
  user1Id: string, 
  user1Name: string, 
  user1Photo: string,
  user2Id: string, 
  user2Name: string, 
  user2Photo: string
): Promise<string> => {
  console.log('Creating chat conversation between:', user1Name, 'and', user2Name);
  
  // Sort participants to ensure consistent ordering
  const participants = [user1Id, user2Id].sort();
  const participantNames = participants[0] === user1Id ? [user1Name, user2Name] : [user2Name, user1Name];
  const participantPhotos = participants[0] === user1Id ? [user1Photo, user2Photo] : [user2Photo, user1Photo];
  
  const chatsRef = collection(db, 'chats');
  
  try {
    const docRef = await addDoc(chatsRef, {
      participants,
      participantNames,
      participantPhotos,
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      lastMessageSender: '',
      unreadCount: {
        [user1Id]: 0,
        [user2Id]: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Chat conversation created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat conversation:', error);
    throw error;
  }
};

export const getChatConversation = async (user1Id: string, user2Id: string): Promise<ChatConversation | null> => {
  console.log('Getting chat conversation between:', user1Id, 'and', user2Id);
  
  const chatsRef = collection(db, 'chats');
  
  try {
    // Create sorted participants array to ensure consistent querying
    const participants = [user1Id, user2Id].sort();
    
    const q = query(
      chatsRef,
      where('participants', '==', participants)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const conversation = querySnapshot.docs[0];
      console.log('Found existing chat conversation:', conversation.id);
      return {
        id: conversation.id,
        ...conversation.data()
      } as ChatConversation;
    }
    
    console.log('No existing chat conversation found');
    return null;
  } catch (error) {
    console.error('Error getting chat conversation:', error);
    throw error;
  }
};

export const getUserConversations = async (userId: string): Promise<ChatConversation[]> => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ChatConversation));
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string,
  message: string,
  otherUserId: string
): Promise<void> => {
  // Add message to messages collection
  const messagesRef = collection(db, 'messages');
  await addDoc(messagesRef, {
    chatId,
    senderId,
    senderName,
    senderPhoto,
    message: message.trim(),
    timestamp: serverTimestamp(),
    isRead: false
  });
  
  // Update chat conversation
  const chatRef = doc(db, 'chats', chatId);
  
  // Get current conversation to calculate new unread count
  const currentChat = await getChatConversation(senderId, otherUserId);
  const currentUnreadCount = currentChat?.unreadCount[otherUserId] || 0;
  
  await updateDoc(chatRef, {
    lastMessage: message.trim(),
    lastMessageTime: serverTimestamp(),
    lastMessageSender: senderId,
    [`unreadCount.${otherUserId}`]: currentUnreadCount + 1,
    updatedAt: serverTimestamp()
  });
};

export const getChatMessages = async (chatId: string, limitCount = 50): Promise<ChatMessage[]> => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  const messages = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ChatMessage));
  
  return messages.reverse(); // Return in chronological order
};

export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    and(
      where('chatId', '==', chatId),
      where('senderId', '!=', userId),
      where('isRead', '==', false)
    )
  );
  
  const querySnapshot = await getDocs(q);
  const updatePromises = querySnapshot.docs.map(doc => 
    updateDoc(doc.ref, { isRead: true })
  );
  
  await Promise.all(updatePromises);
  
  // Reset unread count for this user
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    [`unreadCount.${userId}`]: 0
  });
};

export const subscribeToMessages = (chatId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
    
    callback(messages);
  });
};

export const subscribeToConversations = (userId: string, callback: (conversations: ChatConversation[]) => void): Unsubscribe => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const conversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatConversation))
    .sort((a, b) => {
      // Sort by updatedAt in descending order (most recent first)
      if (!a.updatedAt || !b.updatedAt) return 0;
      return b.updatedAt.toMillis() - a.updatedAt.toMillis();
    });
    
    callback(conversations);
  });
};

// Admin functions
export const getAllConversations = async (): Promise<ChatConversation[]> => {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, orderBy('updatedAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ChatConversation));
};

export const getAllMessages = async (): Promise<ChatMessage[]> => {
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ChatMessage));
};