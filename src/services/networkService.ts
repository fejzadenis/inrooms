import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface NetworkProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  profile_title?: string;
  profile_company?: string;
  profile_location?: string;
  profile_about?: string;
  profile_skills?: string[];
  photo_url?: string;
  connections?: string[];
}

export const networkService = {
  // Get all users for networking (excluding current user)
  async getNetworkUsers(currentUserId: string): Promise<NetworkProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'user'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'user',
            profile_title: data.profile_title || '',
            profile_company: data.profile_company || '',
            profile_location: data.profile_location || '',
            profile_about: data.profile_about || '',
            profile_skills: data.profile_skills || [],
            photo_url: data.photo_url || '',
            connections: data.connections || []
          } as NetworkProfile;
        })
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
      const userRef = doc(db, 'users', userId);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Add to both users' connections arrays
      await Promise.all([
        updateDoc(userRef, {
          connections: arrayUnion(targetUserId)
        }),
        updateDoc(targetUserRef, {
          connections: arrayUnion(userId)
        })
      ]);

    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  },

  // Remove a connection
  async removeConnection(userId: string, targetUserId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Remove from both users' connections arrays
      await Promise.all([
        updateDoc(userRef, {
          connections: arrayRemove(targetUserId)
        }),
        updateDoc(targetUserRef, {
          connections: arrayRemove(userId)
        })
      ]);

    } catch (error) {
      console.error('Error removing connection:', error);
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
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'user',
            profile_title: data.profile_title || '',
            profile_company: data.profile_company || '',
            profile_location: data.profile_location || '',
            profile_about: data.profile_about || '',
            profile_skills: data.profile_skills || [],
            photo_url: data.photo_url || '',
            connections: data.connections || []
          } as NetworkProfile;
        })
        .filter(user => {
          if (user.id === currentUserId) return false;
          
          const searchLower = searchTerm.toLowerCase();
          return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.profile_company?.toLowerCase().includes(searchLower) ||
            user.profile_title?.toLowerCase().includes(searchLower) ||
            user.profile_skills?.some(skill => skill.toLowerCase().includes(searchLower))
          );
        });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};