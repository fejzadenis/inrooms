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
    console.log(`[Event Service] Checking quota for user ${userId} for event ${eventId}`);
    const userIdString = userId.toString();

    // 1. Fetch the user's current usage and quota
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('subscriptions_event_used, subscriptions_event_quota')
      .eq('id', userIdString)
      .single();

    if (fetchError || !userData) {
      throw new Error(`❌ Failed to fetch user data: ${fetchError?.message}`);
    }

    const used = userData.subscriptions_event_used ?? 0;
    const quota = userData.subscriptions_event_quota ?? 0;

    // 2. Quota check
    if (used >= quota) {
      console.warn(`🚫 User ${userIdString} has reached their event quota (${used}/${quota})`);
      throw new Error('You have reached your event participation limit.');
    }

    // 3. Increment subscriptions_event_used
    const { error: updateError } = await supabase
      .from('users')
      .update({ subscriptions_event_used: used + 1 })
      .eq('id', userIdString);

    if (updateError) {
      throw new Error(`❌ Failed to update usage count: ${updateError.message}`);
    }

    console.log(`✅ User ${userIdString} successfully incremented (${used + 1}/${quota})`);

  } catch (error) {
    console.error('Error in registerForEvent:', error);
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