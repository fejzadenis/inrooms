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
  getDoc,
  limit
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
    // Use only where clause to avoid composite index requirement
    // We'll sort the messages client-side
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      limit(100) // Limit to prevent too much data
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Message[];
      
      // Sort messages by timestamp client-side
      const sortedMessages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      callback(sortedMessages);
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
    // Use your existing index: participants (ascending), updatedAt (ascending)
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const chats = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const chatData = doc.data();
          
          // Get last message for this chat - use simple query without orderBy
          const messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', doc.id),
            limit(1)
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          let lastMessage = null;
          
          if (!messagesSnapshot.empty) {
            // Get all messages and find the most recent one client-side
            const allMessagesQuery = query(
              collection(db, 'messages'),
              where('chatId', '==', doc.id)
            );
            const allMessagesSnapshot = await getDocs(allMessagesQuery);
            
            if (!allMessagesSnapshot.empty) {
              const messages = allMessagesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
              }));
              
              // Sort and get the last message
              const sortedMessages = messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
              lastMessage = sortedMessages[0];
            }
          }
          
          return {
            id: doc.id,
            ...chatData,
            updatedAt: chatData.updatedAt?.toDate() || new Date(),
            lastMessage: lastMessage || undefined,
          };
        })
      );
      
      callback(chats as Chat[]);
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