import { collection, query, where, getDocs, limit } from 'firebase/firestore';
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
        where('id', '!=', userId),
        limit(10)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
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
        where('tags', 'array-contains-any', userInterests),
        where('date', '>', new Date()),
        limit(5)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting event recommendations:', error);
      throw error;
    }
  }
};