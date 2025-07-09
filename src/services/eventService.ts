import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { supabase } from '../config/supabase';

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: Date;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  meetLink?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventRegistration {
  id?: string;
  userId: string;
  eventId: string;
  registeredAt: Date;
}

export const eventService = {
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        ...eventData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  async getEvents(): Promise<Event[]> {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Handle date conversion properly, checking if it's a Timestamp
        const date = data.date instanceof Timestamp ? 
          data.date.toDate() : 
          (data.date && typeof data.date.toDate === 'function' ? 
            data.date.toDate() : 
            new Date(data.date));
            
        return {
          id: doc.id,
          ...data,
          date: date,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
        };
      }) as Event[];
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  },

  async registerForEvent(userId: string, eventId: string): Promise<void> {
    try {
      // Add registration
      const firebaseRegistration = await addDoc(collection(db, 'registrations'), {
        userId,
        eventId,
        registeredAt: serverTimestamp(),
      });

      // Update event participant count
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        currentParticipants: increment(1),
      });

      // Also register in Supabase for redundancy
      const { error } = await supabase
        .from('registrations')
        .insert({
          user_id: userId,
          event_id: eventId,
          registered_at: new Date().toISOString(),
        });
        
      if (error) {
        console.error('Error registering in Supabase:', error);
        // Continue even if Supabase fails - Firebase is primary
      }
      
      // Update user's events used count in Supabase
      // The trigger in Supabase will handle this automatically
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      // Try to get registrations from Supabase first
      const { data: supabaseRegistrations, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', userId);
        
      if (!error && supabaseRegistrations && supabaseRegistrations.length > 0) {
        // Use Supabase data if available
        return supabaseRegistrations.map(reg => ({
          id: reg.id,
          userId: reg.user_id,
          eventId: reg.event_id,
          registeredAt: new Date(reg.registered_at)
        })) as EventRegistration[];
      }
      
      // Fall back to Firebase if Supabase fails or returns no data
      const q = query(
        collection(db, 'registrations'), 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate?.() || new Date(),
        };
      }) as EventRegistration[];
    } catch (error) {
      console.error('Error getting user registrations:', error);
      throw error;
    }
  },

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    try {
      // Try to get registrations from Supabase first
      const { data: supabaseRegistrations, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);
        
      if (!error && supabaseRegistrations && supabaseRegistrations.length > 0) {
        // Use Supabase data if available
        return supabaseRegistrations.map(reg => ({
          id: reg.id,
          userId: reg.user_id,
          eventId: reg.event_id,
          registeredAt: new Date(reg.registered_at)
        })) as EventRegistration[];
      }
      
      // Fall back to Firebase if Supabase fails or returns no data
      const q = query(
        collection(db, 'registrations'), 
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate?.() || new Date(),
        };
      }) as EventRegistration[];
    } catch (error) {
      console.error('Error getting event registrations:', error);
      throw error;
    }
  }
};