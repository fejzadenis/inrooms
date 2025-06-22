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
      where('chatId', '==', chatId)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Message[];
      
      // Sort messages by timestamp (oldest first for chat display)
      const sortedMessages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      callback(sortedMessages);
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
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, async (snapshot) => {
      try {
        const chats = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const chatData = doc.data();
            
            // Get the most recent message for this chat
            const messagesQuery = query(
              collection(db, 'messages'),
              where('chatId', '==', doc.id)
            );
            
            const messagesSnapshot = await getDocs(messagesQuery);
            let lastMessage = null;
            
            if (!messagesSnapshot.empty) {
              const messages = messagesSnapshot.docs.map(msgDoc => ({
                id: msgDoc.id,
                ...msgDoc.data(),
                timestamp: msgDoc.data().timestamp?.toDate() || new Date(),
              }));
              
              // Sort and get the most recent message
              const sortedMessages = messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
              lastMessage = sortedMessages[0];
            }
            
            return {
              id: doc.id,
              ...chatData,
              updatedAt: chatData.updatedAt?.toDate() || new Date(),
              lastMessage: lastMessage || undefined,
            };
          })
        );
        
        // Sort chats by updatedAt (most recent first)
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
  }
};