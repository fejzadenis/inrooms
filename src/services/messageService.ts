import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Message, Chat } from '../types/messages';

export const messageService = {
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
    try {
      const chatId = [senderId, receiverId].sort().join('_');
      
      // Create or update chat with explicit document ID
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        participants: [senderId, receiverId],
        updatedAt: Timestamp.now(),
      }, { merge: true });

      // Add message
      await addDoc(collection(db, 'messages'), {
        senderId,
        receiverId,
        content,
        timestamp: Timestamp.now(),
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
        timestamp: doc.data().timestamp.toDate(),
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

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Chat[];
      callback(chats);
    });
  },
};