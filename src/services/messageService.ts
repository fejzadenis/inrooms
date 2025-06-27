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
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { connectionService } from './connectionService';
import type { Message, Chat } from '../types/messages';

export const messageService = {
  async sendMessage(senderId: string, receiverId: string, content: string, existingChatId?: string): Promise<void> {
    try {
      // First check if users are connected
      const canMessage = await this.canMessage(senderId, receiverId);
      if (!canMessage) {
        throw new Error('You can only message your connections');
      }

      // Get or create chat ID
      const chatId = existingChatId || [senderId, receiverId].sort().join('_');
      
      // Create or update chat first
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        participants: [senderId, receiverId],
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });

      // Add message
      const messageData = {
        senderId,
        receiverId,
        content: content.trim(),
        timestamp: serverTimestamp(),
        read: false,
        chatId,
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update chat with last message timestamp
      await updateDoc(chatRef, {
        updatedAt: serverTimestamp(),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToChat(chatId: string, callback: (messages: Message[]) => void): () => void {
    // Query messages for this specific chat
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      }) as Message[];
      
      callback(messages);
    }, (error) => {
      console.error('Error in chat subscription:', error);
      callback([]);
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
    // Simplified query without ordering to avoid index requirement
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, async (snapshot) => {
      try {
        const chats = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const chatData = doc.data();
            
            // Get the most recent message for this chat - remove orderBy to avoid composite index requirement
            const messagesQuery = query(
              collection(db, 'messages'),
              where('chatId', '==', doc.id),
              limit(50) // Get more messages and sort in memory
            );
            
            const messagesSnapshot = await getDocs(messagesQuery);
            let lastMessage = null;
            
            if (!messagesSnapshot.empty) {
              // Sort messages by timestamp in memory and get the most recent
              const messages = messagesSnapshot.docs
                .map(messageDoc => {
                  const messageData = messageDoc.data();
                  return {
                    id: messageDoc.id,
                    ...messageData,
                    timestamp: messageData.timestamp?.toDate() || new Date(),
                  };
                })
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
              
              lastMessage = messages[0];
            }
            
            return {
              id: doc.id,
              ...chatData,
              updatedAt: chatData.updatedAt?.toDate() || new Date(),
              createdAt: chatData.createdAt?.toDate() || new Date(),
              lastMessage: lastMessage || undefined,
            };
          })
        );
        
        // Sort chats by updatedAt in memory (most recent first)
        const sortedChats = chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        callback(sortedChats as Chat[]);
      } catch (error) {
        console.error('Error in chats subscription:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error subscribing to user chats:', error);
      callback([]);
    });
  },

  // Check if two users can message each other (are connected)
  async canMessage(userId: string, targetUserId: string): Promise<boolean> {
    try {
      return await connectionService.checkIfUsersAreConnected(userId, targetUserId);
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
  },

  // Get existing chat between two users
  async getChatId(userId: string, targetUserId: string): Promise<string | null> {
    try {
      const chatId = [userId, targetUserId].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      return chatDoc.exists() ? chatId : null;
    } catch (error) {
      console.error('Error getting chat ID:', error);
      return null;
    }
  },

  // Get unread message count for a user
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }
};