import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User } from '../types/user';

export const recommendationService = {
  async getConnectionRecommendations(userId: string, userSkills: string[]): Promise<User[]> {
    try {
      // Get users with similar skills
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('profile.skills', 'array-contains-any', userSkills),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => user.id !== userId); // Exclude current user

      return users;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },

  async getEventRecommendations(userId: string, userInterests: string[]): Promise<any[]> {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('date', '>', new Date()),
        orderBy('date', 'asc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
    } catch (error) {
      console.error('Error getting event recommendations:', error);
      throw error;
    }
  },

  async getNetworkingRecommendations(userId: string): Promise<User[]> {
    try {
      // Get users who are not already connected
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'user'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => user.id !== userId); // Exclude current user

      return users;
    } catch (error) {
      console.error('Error getting networking recommendations:', error);
      throw error;
    }
  }
};