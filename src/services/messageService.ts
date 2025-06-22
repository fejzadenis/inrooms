import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  setDoc,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Message, Chat } from '../types/messages';

export const messageService = {
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
    try {
      // First check if users are connected
      const canMessage = await this.canMessage(senderId, receiverId);
      if (!canMessage) {
        throw new Error('You can only message your connections');
      }

      const chatId = [senderId, receiverId].sort().join('_');
      
      // Create or update chat
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        participants: [senderId, receiverId],
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Add message
      await addDoc(collection(db, 'messages'), {
        senderId,
        receiverId,
        content,
        timestamp: serverTimestamp(),
        read: false,
        chatId,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToChat(chatId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Message[];
      callback(messages);
    });
  },

  async markAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { read: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    // Modified query to avoid composite index requirement
    // We'll get all chats for the user and sort them client-side
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, async (snapshot) => {
      const chats = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const chatData = doc.data();
          
          // Get last message for this chat
          const messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', doc.id),
            orderBy('timestamp', 'desc')
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          const lastMessage = messagesSnapshot.docs[0]?.data();
          
          return {
            id: doc.id,
            ...chatData,
            updatedAt: chatData.updatedAt?.toDate() || new Date(),
            lastMessage: lastMessage ? {
              id: messagesSnapshot.docs[0].id,
              ...lastMessage,
              timestamp: lastMessage.timestamp?.toDate() || new Date(),
            } : undefined,
          };
        })
      );
      
      // Sort chats by updatedAt client-side to avoid index requirement
      const sortedChats = chats.sort((a, b) => {
        const aTime = a.updatedAt?.getTime() || 0;
        const bTime = b.updatedAt?.getTime() || 0;
        return bTime - aTime; // Descending order (most recent first)
      });
      
      callback(sortedChats as Chat[]);
    });
  },

  // Check if two users can message each other (are connected)
  async canMessage(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const connections = userDoc.data().connections || [];
        return connections.includes(targetUserId);
      }
      return false;
    } catch (error) {
      console.error('Error checking message permissions:', error);
      return false;
    }
  },

  // Create a chat between two connected users
  async createChat(userId: string, targetUserId: string): Promise<string> {
    try {
      // Check if users are connected
      const canMessage = await this.canMessage(userId, targetUserId);
      if (!canMessage) {
        throw new Error('You can only message your connections');
      }

      const chatId = [userId, targetUserId].sort().join('_');
      
      // Create chat document
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        participants: [userId, targetUserId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return chatId;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }
};