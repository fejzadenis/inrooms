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
      console.log("Registering user for event:", { userId, eventId });
      const userIdString = userId.toString();
      const eventIdString = eventId.toString();

      // Instead of creating a registration record, directly increment the user's event usage
      console.log("Incrementing user event usage in Supabase");
      const { data, error } = await supabase
        .rpc('increment_user_event_usage', {
          user_id: userIdString,
          event_id: eventIdString
        });

      if (error) {
        console.error('Error incrementing user event usage in Supabase:', error);
        throw new Error(`Error updating subscription usage: ${error.message}`);
      }
      
      // Add registration to Firebase
      const firebaseRegistration = await addDoc(collection(db, 'registrations'), {
        userId: userIdString,
        eventId: eventIdString,
        registeredAt: serverTimestamp(),
      });

      // Update event participant count in Firebase  
      const eventRef = doc(db, 'events', eventIdString);
      await updateDoc(eventRef, {
        currentParticipants: increment(1),
      });

      console.log("Registration successful - updated user quota and event participants");
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      // Ensure userId is a string
      // We're now only using Firebase for registrations
      console.log(`[Event Service] Getting registrations for user ${userId} from Firebase`);
      const q = query(
        collection(db, 'registrations'), 
        where('userId', '==', userId.toString())
      );
      const querySnapshot = await getDocs(q);
      const firebaseRegistrations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate?.() || new Date(),
        };
      }) as EventRegistration[];
      
      console.log(`[Event Service] Found ${firebaseRegistrations.length} registrations in Firebase`);
      return firebaseRegistrations;
    } catch (error) {
      console.error('Error getting user registrations:', error);
      throw error;
    }
  },

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    try {
      // Ensure eventId is a string for Supabase query
      // We're now only using Firebase for registrations
      console.log(`[Event Service] Getting registrations for event ${eventId} from Firebase`);
      const q = query(
        collection(db, 'registrations'), 
        where('eventId', '==', eventId.toString())
      );
      const querySnapshot = await getDocs(q);
      const firebaseRegistrations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate?.() || new Date(),
        };
      }) as EventRegistration[];
      
      console.log(`[Event Service] Found ${firebaseRegistrations.length} registrations in Firebase`);
      return firebaseRegistrations;
    } catch (error) {
      console.error('Error getting event registrations:', error);
      throw error;
    }
  }
};