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
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Message, Chat } from '../types/messages';

export const messageService = {
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
    try {
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
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
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
              ...lastMessage,
              timestamp: lastMessage.timestamp?.toDate() || new Date(),
            } : undefined,
          };
        })
      );
      callback(chats as Chat[]);
    });
  },
};