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

interface RegistrationResult {
  success: boolean;
  message?: string;
}

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
          id: doc.id as string,
          userId: data.userId as string,
          eventId: data.eventId as string,
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

  async canRegisterForEvent(userId: string, eventId: string): Promise<RegistrationResult> {
    try {
      // Call the Supabase function to check if user can register
      const { data, error } = await supabase.rpc('can_register_for_event', {
        user_id: userId,
        event_id: eventId
      });
      
      if (error) {
        console.error('Error checking registration eligibility:', error);
        return { 
          success: false, 
          message: 'Failed to check registration eligibility' 
        };
      }
      
      if (!data) {
        // Get more detailed error message
        const { data: user } = await supabase
          .from('users')
          .select('subscription_events_quota, subscription_events_used')
          .eq('id', userId)
          .single();
          
        const { data: eventData } = await supabase
          .from('events')
          .select('current_participants, max_participants')
          .eq('id', eventId)
          .single();
          
        if (user && eventData) {
          if (user.subscription_events_used >= user.subscription_events_quota) {
            return { 
              success: false, 
              message: 'You have reached your event quota. Please upgrade your subscription.' 
            };
          }
          
          if (eventData.current_participants >= eventData.max_participants) {
            return { 
              success: false, 
              message: 'This event is full.' 
            };
          }
        }
        
        return { 
          success: false, 
          message: 'You are not eligible to register for this event.' 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error checking registration eligibility:', error);
      return { 
        success: false, 
        message: 'Failed to check registration eligibility' 
      }
    }
  },

  async registerForEvent(userId: string, eventId: string): Promise<RegistrationResult> {
    try {
      // Call the Supabase function to register for the event
      const { data, error } = await supabase.rpc('increment_user_event_usage', {
        user_id: userId,
        event_id: eventId
      });
      
      if (error) {
        console.error('Error registering for event:', error);
        return { 
          success: false, 
          message: 'Failed to register for event' 
        };
      }
      
      if (!data) {
        return { 
          success: false, 
          message: 'Failed to register for event. You may have reached your quota or the event may be full.' 
        };
      }
      
      // Also register in Firebase for redundancy
      try {
        await addDoc(collection(db, 'registrations'), {
          userId,
          eventId,
          registeredAt: serverTimestamp(),
        });
      } catch (firebaseError) {
        console.error('Error registering in Firebase:', firebaseError);
        // Continue even if Firebase fails - Supabase is now primary
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error registering for event:', error);
      return { 
        success: false, 
        message: 'Failed to register for event' 
      };
    }
  },

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      // Try to get registrations from Supabase first
      const { data: supabaseRegistrations, error } = await supabase
        .rpc('get_user_registrations', { user_id: userId });
        
      if (!error && supabaseRegistrations && supabaseRegistrations.length > 0) {
        // Use Supabase data if available
        return supabaseRegistrations.map(reg => ({
          id: reg.id || '',
          userId: reg.user_id || userId,
          eventId: reg.event_id || '',
          registeredAt: reg.registered_at ? new Date(reg.registered_at) : new Date()
        })) as EventRegistration[];
      }
      
      // Get registrations from Firebase
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
      const { data: supabaseRegistrations, error } = await supabase
        .rpc('get_event_registrations', { event_id: eventId });
        
      if (!error && supabaseRegistrations && supabaseRegistrations.length > 0) {
        // Use Supabase data if available
        return supabaseRegistrations.map(reg => ({
          id: reg.id || '',
          userId: reg.user_id || '',
          eventId: reg.event_id || eventId,
          registeredAt: reg.registered_at ? new Date(reg.registered_at) : new Date()
        })) as EventRegistration[];
      }
      
      // Get registrations from Firebase
      console.log(`[Event Service] Found ${firebaseRegistrations.length} registrations in Firebase`);
      return firebaseRegistrations;
    } catch (error) {
      console.error('Error getting event registrations:', error);
      throw error;
    }
  },

  // Check if user can register for an event
  async canRegisterForEvent(userId: string, eventId: string): Promise<RegistrationResult> {
    try {
      const { data, error } = await supabase
        .rpc('can_register_for_event', {
          user_id: userId,
          event_id: eventId
        });
      
      if (error) {
        console.error('Error checking registration eligibility:', error);
        return { 
          success: false, 
          message: `Error checking registration eligibility: ${error.message}` 
        };
      }
      
      if (!data) {
        // Get user's subscription data to determine the reason
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('subscription_status, subscription_events_quota, subscription_events_used')
          .eq('id', userId)
          .single();
          
        if (userError) {
          return { success: false, message: 'Could not verify registration eligibility' };
        }
        
        if (userData.subscription_events_used >= userData.subscription_events_quota) {
          return { success: false, message: 'You have reached your event quota. Please upgrade your subscription.' };
        }
        
        // Check if event is full
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('max_participants, current_participants')
          .eq('id', eventId)
          .single();
          
        if (eventError) {
          return { success: false, message: 'Could not verify event availability' };
        }
        
        if (eventData.current_participants >= eventData.max_participants) {
          return { success: false, message: 'This event is full' };
        }
        
        return { success: false, message: 'You are not eligible to register for this event' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error checking registration eligibility:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
};