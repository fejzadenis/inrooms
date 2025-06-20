import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export const reminderService = {
  async createDailyReminder(userId: string) {
    try {
      const remindersRef = collection(db, 'reminders');
      await addDoc(remindersRef, {
        userId,
        type: 'linkedin_connection',
        createdAt: serverTimestamp(),
        scheduledFor: new Date(new Date().setHours(9, 0, 0, 0)), // 9 AM next day
        status: 'pending'
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  async checkDailyReminders(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const remindersRef = collection(db, 'reminders');
      const q = query(
        remindersRef,
        where('userId', '==', userId),
        where('scheduledFor', '>=', today),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // No reminder for today, create one
        await this.createDailyReminder(userId);
      }

      // Show reminder notification
      toast('Time to connect with your network! Check your LinkedIn connections.', {
        duration: 5000,
        icon: '🔔'
      });
    } catch (error) {
      console.error('Error checking reminders:', error);
      throw error;
    }
  }
};