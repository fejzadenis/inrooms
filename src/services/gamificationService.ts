import { doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Badge } from '../types/user';

const POINTS = {
  NEW_CONNECTION: 10,
  EVENT_ATTENDANCE: 20,
  PROFILE_COMPLETE: 15,
  TESTIMONIAL_RECEIVED: 25,
  DEAL_SHARED: 30
};

const BADGES: Record<string, Badge> = {
  NETWORKING_STARTER: {
    id: 'networking_starter',
    name: 'Networking Starter',
    description: 'Made your first connection',
    icon: 'users',
    category: 'networking',
    unlockedAt: new Date()
  },
  EVENT_ENTHUSIAST: {
    id: 'event_enthusiast',
    name: 'Event Enthusiast',
    description: 'Attended 5 events',
    icon: 'calendar',
    category: 'events',
    unlockedAt: new Date()
  }
};

export const gamificationService = {
  async awardPoints(userId: string, action: keyof typeof POINTS): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'profile.points': increment(POINTS[action])
      });
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  },

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      const badge = BADGES[badgeId];
      if (!badge) throw new Error('Invalid badge ID');

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'profile.badges': arrayUnion(badge)
      });
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  },

  async checkAndAwardBadges(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return;
      
      const userData = userDoc.data();
      const connections = userData.connections || [];
      const eventsUsed = userData.subscription?.eventsUsed || 0;
      const currentBadges = userData.profile?.badges || [];
      const currentBadgeIds = currentBadges.map((badge: Badge) => badge.id);

      // Check for networking starter badge
      if (connections.length >= 1 && !currentBadgeIds.includes('networking_starter')) {
        await this.awardBadge(userId, 'NETWORKING_STARTER');
      }

      // Check for event enthusiast badge
      if (eventsUsed >= 5 && !currentBadgeIds.includes('event_enthusiast')) {
        await this.awardBadge(userId, 'EVENT_ENTHUSIAST');
      }
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      throw error;
    }
  }
};