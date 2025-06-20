import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  addDoc,
  serverTimestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface NetworkProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  profile?: {
    title?: string;
    company?: string;
    location?: string;
    skills?: string[];
    about?: string;
  };
  photoURL?: string;
  connections?: string[];
}

export interface Connection {
  id?: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export const networkService = {
  // Get all users for networking (excluding current user)
  async getNetworkUsers(currentUserId: string): Promise<NetworkProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'user'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as NetworkProfile))
        .filter(user => user.id !== currentUserId);

      return users;
    } catch (error) {
      console.error('Error getting network users:', error);
      throw error;
    }
  },

  // Get user's connections
  async getUserConnections(userId: string): Promise<string[]> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().connections || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting user connections:', error);
      throw error;
    }
  },

  // Add a connection
  async addConnection(userId: string, targetUserId: string): Promise<void> {
    try {
      // Add connection record
      await addDoc(collection(db, 'connections'), {
        userId,
        connectedUserId: targetUserId,
        status: 'accepted', // For now, auto-accept connections
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update both users' connections arrays
      const userRef = doc(db, 'users', userId);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Get current connections
      const userDoc = await getDoc(userRef);
      const targetUserDoc = await getDoc(targetUserRef);

      const userConnections = userDoc.exists() ? (userDoc.data().connections || []) : [];
      const targetUserConnections = targetUserDoc.exists() ? (targetUserDoc.data().connections || []) : [];

      // Add to connections if not already connected
      if (!userConnections.includes(targetUserId)) {
        userConnections.push(targetUserId);
      }
      if (!targetUserConnections.includes(userId)) {
        targetUserConnections.push(userId);
      }

      // Update both users
      await setDoc(userRef, { connections: userConnections }, { merge: true });
      await setDoc(targetUserRef, { connections: targetUserConnections }, { merge: true });

    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  },

  // Remove a connection
  async removeConnection(userId: string, targetUserId: string): Promise<void> {
    try {
      // Remove from connections collection
      const connectionsRef = collection(db, 'connections');
      const q1 = query(
        connectionsRef,
        where('userId', '==', userId),
        where('connectedUserId', '==', targetUserId)
      );
      const q2 = query(
        connectionsRef,
        where('userId', '==', targetUserId),
        where('connectedUserId', '==', userId)
      );

      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const deletePromises = [];
      snapshot1.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));
      snapshot2.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));
      
      await Promise.all(deletePromises);

      // Update both users' connections arrays
      const userRef = doc(db, 'users', userId);
      const targetUserRef = doc(db, 'users', targetUserId);

      const userDoc = await getDoc(userRef);
      const targetUserDoc = await getDoc(targetUserRef);

      if (userDoc.exists()) {
        const userConnections = (userDoc.data().connections || []).filter((id: string) => id !== targetUserId);
        await setDoc(userRef, { connections: userConnections }, { merge: true });
      }

      if (targetUserDoc.exists()) {
        const targetUserConnections = (targetUserDoc.data().connections || []).filter((id: string) => id !== userId);
        await setDoc(targetUserRef, { connections: targetUserConnections }, { merge: true });
      }

    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },

  // Get connection recommendations based on skills
  async getConnectionRecommendations(userId: string, userSkills: string[]): Promise<NetworkProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      let recommendations: NetworkProfile[] = [];

      if (userSkills.length > 0) {
        // Get users with similar skills
        const q = query(
          usersRef,
          where('profile.skills', 'array-contains-any', userSkills),
          limit(20)
        );

        const snapshot = await getDocs(q);
        recommendations = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as NetworkProfile))
          .filter(user => user.id !== userId);
      }

      // If not enough recommendations, get random users
      if (recommendations.length < 10) {
        const q = query(
          usersRef,
          where('role', '==', 'user'),
          limit(20)
        );

        const snapshot = await getDocs(q);
        const additionalUsers = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as NetworkProfile))
          .filter(user => 
            user.id !== userId && 
            !recommendations.some(rec => rec.id === user.id)
          );

        recommendations = [...recommendations, ...additionalUsers].slice(0, 10);
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting connection recommendations:', error);
      throw error;
    }
  },

  // Search users by name, company, or title
  async searchUsers(searchTerm: string, currentUserId: string): Promise<NetworkProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'user'), limit(50));

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as NetworkProfile))
        .filter(user => {
          if (user.id === currentUserId) return false;
          
          const searchLower = searchTerm.toLowerCase();
          return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.profile?.company?.toLowerCase().includes(searchLower) ||
            user.profile?.title?.toLowerCase().includes(searchLower) ||
            user.profile?.skills?.some(skill => skill.toLowerCase().includes(searchLower))
          );
        });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};