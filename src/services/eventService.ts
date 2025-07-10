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

async function incrementEventParticipants(eventId: string) {
  const eventRef = doc(db, "events", eventId);

  try {
    await updateDoc(eventRef, {
      currentParticipants: increment(1)
    });
  } catch (error) {
    console.error(`❌ Failed to update event participants in Firestore: ${error}`);
    throw error;
  }
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

    // 1. Fetch user's quota usage
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('subscription_events_used, subscription_events_quota')
      .eq('id', userIdString)
      .single();

    if (userFetchError || !userData) {
      throw new Error(`❌ Failed to fetch user data: ${userFetchError?.message}`);
    }

    const used = userData.subscription_events_used ?? 0;
    const quota = userData.subscription_events_quota ?? 0;

    if (used >= quota) {
      throw new Error('🚫 You have reached your event participation limit.');
    }

    // 2. Store registration
    const { error: registrationError } = await supabase
      .from('registrations')
      .insert({
        user_id: userIdString,
        event_id: eventId,
        registered_at: new Date().toISOString(),
      });

    if (registrationError) {
      throw new Error(`❌ Failed to register user: ${registrationError.message}`);
    }

    // 3. Increment current_participants in events table
    await incrementEventParticipants(eventId);
    const { error: updateEventError } = await supabase
      .from('events')
      .update({ current_participants: supabase.rpc('increment_by_one') })
      .eq('id', eventId);

    if (updateEventError) {
      console.error(`❌ Failed to update event participants: ${updateEventError.message}`);
      
      // Fallback to direct update if RPC fails
      const { data: eventData } = await supabase
        .from('events')
        .select('current_participants')
        .eq('id', eventId)
        .single();
        
      if (eventData) {
        const newCount = (eventData.current_participants || 0) + 1;
        const { error: directUpdateError } = await supabase
          .from('events')
          .update({ current_participants: newCount })
          .eq('id', eventId);
          
        if (directUpdateError) {
          throw new Error(`❌ Failed to update event participants: ${directUpdateError.message}`);
        }
      }
    }

    // 4. Increment user's quota usage
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ subscription_events_used: used + 1 })
      .eq('id', userIdString);

    if (updateUserError) {
      throw new Error(`❌ Failed to update user's used quota: ${updateUserError.message}`);
    }

    console.log(`✅ Registration complete for user ${userIdString} for event ${eventId}`);
  } catch (error) {
    console.error('❌ Error in registerForEvent:', error);
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