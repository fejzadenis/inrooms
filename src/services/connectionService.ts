import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

export const connectionService = {
  async addConnection(userId: string, connectionId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const connectionRef = doc(db, 'users', connectionId);

      // Add connection for both users
      await updateDoc(userRef, {
        connections: arrayUnion(connectionId)
      });

      await updateDoc(connectionRef, {
        connections: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  },

  async removeConnection(userId: string, connectionId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const connectionRef = doc(db, 'users', connectionId);

      // Remove connection for both users
      await updateDoc(userRef, {
        connections: arrayRemove(connectionId)
      });

      await updateDoc(connectionRef, {
        connections: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },
};