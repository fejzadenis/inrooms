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
      const userIdString = userId.toString();
      console.log(`[Event Service] Converted userId to string: ${userIdString}`);
      
      // Also register in Supabase for redundancy
      console.log(`[Event Service] Creating registration in Supabase`);
      const { error } = await supabase
        .from('registrations')
        .insert({
          user_id: userId, // Firebase user IDs are strings, not UUIDs
          event_id: eventId,
          registered_at: new Date().toISOString(),
        });
        
      if (error) {
        console.error('Error registering in Supabase:', error);
        throw new Error(`Error registering in Supabase: ${error.message}`);
        // If Supabase fails, try Firebase as fallback
        console.log(`[Event Service] Falling back to Firebase registration`);
        const firebaseRegistration = await addDoc(collection(db, 'registrations'), {
          userId: userIdString,
          eventId,
          registeredAt: serverTimestamp(),
        });
        console.log(`[Event Service] Firebase registration created with ID: ${firebaseRegistration.id}`);

        // Update event participant count in Firebase
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
          currentParticipants: increment(1),
        });
        console.log(`[Event Service] Updated event participant count in Firebase`);
      } else {
        console.log(`[Event Service] Supabase registration created successfully`);
        
        // Increment user's subscription_events_used count in Supabase
        console.log(`[Event Service] Incrementing user's subscription_events_used count`);
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            subscription_events_used: supabase.sql`subscription_events_used + 1`
          })
          .eq('id', userIdString);
          
        if (updateError) {
          console.error('Error updating subscription_events_used:', updateError);
        } else {
          console.log(`[Event Service] Successfully incremented subscription_events_used for user ${userIdString}`);
        }
        
        // Even if Supabase succeeds, we still need to update Firebase for consistency
        // This ensures the UI updates correctly when using Firebase data
        console.log(`[Event Service] Updating Firebase to match Supabase`);
        
        try {
          // Add registration to Firebase
          const firebaseRegistration = await addDoc(collection(db, 'registrations'), {
            userId: userIdString,
            eventId,
            registeredAt: serverTimestamp(),
          });
          console.log(`[Event Service] Firebase registration created with ID: ${firebaseRegistration.id}`);
          
          // Update event participant count in Firebase
          const eventRef = doc(db, 'events', eventId);
          await updateDoc(eventRef, {
            currentParticipants: increment(1),
          });
          console.log(`[Event Service] Updated event participant count in Firebase`);
        } catch (firebaseError) {
          console.error('Error updating Firebase after Supabase success:', firebaseError);
          // Continue even if Firebase update fails - Supabase is now primary
        }
      }
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          subscription_events_used: increment(1),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user event count:', updateError);
        // Continue even if update fails - the registration was successful
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      // Try to get registrations from Supabase first
      console.log(`[Event Service] Getting registrations for user ${userId} from Supabase`);
      const userIdString = userId.toString();
      
      const { data: supabaseRegistrations, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', userIdString);
        
      if (!error && supabaseRegistrations && supabaseRegistrations.length > 0) {
        console.log(`[Event Service] Found ${supabaseRegistrations.length} registrations in Supabase`);
        // Use Supabase data if available
        return supabaseRegistrations.map(reg => ({
          id: reg.id,
          userId: reg.user_id,
          eventId: reg.event_id,
          registeredAt: new Date(reg.registered_at)
        })) as EventRegistration[];
      }
      
      console.log(`[Event Service] No registrations found in Supabase or error occurred: ${error?.message}. Falling back to Firebase.`);
      
      // Fall back to Firebase if Supabase fails or returns no data
      const q = query(
        collection(db, 'registrations'), 
        where('userId', '==', userId)
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
      // Try to get registrations from Supabase first
      console.log(`[Event Service] Getting registrations for event ${eventId} from Supabase`);
      
      const { data: supabaseRegistrations, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);
        
      if (!error && supabaseRegistrations && supabaseRegistrations.length > 0) {
        console.log(`[Event Service] Found ${supabaseRegistrations.length} registrations in Supabase`);
        // Use Supabase data if available
        return supabaseRegistrations.map(reg => ({
          id: reg.id,
          userId: reg.user_id,
          eventId: reg.event_id,
          registeredAt: new Date(reg.registered_at)
        })) as EventRegistration[];
      }
      
      console.log(`[Event Service] No registrations found in Supabase or error occurred: ${error?.message}. Falling back to Firebase.`);
      
      // Fall back to Firebase if Supabase fails or returns no data
      const q = query(
        collection(db, 'registrations'), 
        where('eventId', '==', eventId)
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