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
import type { Message, Chat, LastMessage } from '../types/messages';

export const messageService = {
  async sendMessage(senderId: string, receiverId: string, content: string, existingChatId?: string): Promise<void> {
    try {
      // Validate inputs
      if (!senderId || !receiverId || !content?.trim()) {
        throw new Error('Sender ID, receiver ID, and message content are required');
      }

      if (senderId === receiverId) {
        throw new Error('Cannot send message to yourself');
      }

      // First check if users are connected
      const canMessage = await this.canMessage(senderId, receiverId);
      if (!canMessage) {
        throw new Error('You can only message your connections');
      }

      // Get or create chat ID
      const chatId = existingChatId || await this.getOrCreateChat(senderId, receiverId);
      
      // Add message
      const messageData = {
        senderId,
        receiverId,
        content: content.trim(),
        timestamp: serverTimestamp(),
        read: false,
        chatId,
      };

      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Create last message object for chat document
      const lastMessage: Omit<LastMessage, 'timestamp'> & { timestamp: any } = {
        id: messageRef.id,
        senderId,
        receiverId,
        content: content.trim(),
        timestamp: serverTimestamp(),
        read: false,
      };

      // Update chat with last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage,
        updatedAt: serverTimestamp(),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Subscribe to messages for a specific chat - only called when entering a chat
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

      // Also update the lastMessage read status in the chat if this is the last message
      const messageDoc = await getDoc(messageRef);
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        const chatId = messageData.chatId;
        
        // Get the chat to check if this is the last message
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          if (chatData.lastMessage && chatData.lastMessage.id === messageId) {
            await updateDoc(chatRef, {
              'lastMessage.read': true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  // Subscribe to user's chats list - only gets chat metadata, not messages
  subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    // Simple query that gets chats with lastMessage already included
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      try {
        const chats = snapshot.docs.map((doc) => {
          const chatData = doc.data();
          
          // Convert lastMessage timestamp if it exists
          let lastMessage = undefined;
          if (chatData.lastMessage) {
            lastMessage = {
              ...chatData.lastMessage,
              timestamp: chatData.lastMessage.timestamp?.toDate() || new Date(),
            };
          }
          
          return {
            id: doc.id,
            participants: chatData.participants,
            lastMessage,
            updatedAt: chatData.updatedAt?.toDate() || new Date(),
            createdAt: chatData.createdAt?.toDate() || new Date(),
          };
        }) as Chat[];
        
        // Sort chats by updatedAt in memory (most recent first)
        const sortedChats = chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        callback(sortedChats);
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
      if (!userId || !targetUserId) {
        return false;
      }
      
      if (userId === targetUserId) {
        return false;
      }

      return await connectionService.checkIfUsersAreConnected(userId, targetUserId);
    } catch (error) {
      console.error('Error checking message permissions:', error);
      return false;
    }
  },

  // Create a chat between two connected users
  async createChat(userId: string, targetUserId: string): Promise<string> {
    try {
      // Validate inputs
      if (!userId || !targetUserId) {
        throw new Error('Both user IDs are required');
      }

      if (userId === targetUserId) {
        throw new Error('Cannot create chat with yourself');
      }

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
      if (!userId || !targetUserId) {
        return null;
      }

      const chatId = [userId, targetUserId].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      return chatDoc.exists() ? chatId : null;
    } catch (error) {
      console.error('Error getting chat ID:', error);
      return null;
    }
  },

  // Get or create chat between two users
  async getOrCreateChat(userId: string, targetUserId: string): Promise<string> {
    try {
      // First check if chat exists
      let chatId = await this.getChatId(userId, targetUserId);
      
      // If not, create it
      if (!chatId) {
        chatId = await this.createChat(userId, targetUserId);
      }
      
      return chatId;
    } catch (error) {
      console.error('Error getting or creating chat:', error);
      throw error;
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
  },

  // Create a notification for a new message
  async createMessageNotification(senderId: string, receiverId: string, messageContent: string): Promise<void> {
    try {
      // Get sender's name
      const senderRef = doc(db, 'users', senderId);
      const senderDoc = await getDoc(senderRef);
      const senderName = senderDoc.exists() ? senderDoc.data().name : 'Someone';

      // Create notification
      await addDoc(collection(db, 'notifications'), {
        userId: receiverId,
        type: 'message',
        title: 'New Message',
        message: `${senderName}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
        relatedId: senderId, // Use sender ID as related ID
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating message notification:', error);
      // Don't throw - notification failure shouldn't block the message
    }
  }
};