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

interface RegistrationError {
  message: string;
  code: string;
}

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

  async registerForEvent(userId: string, eventId: string): Promise<void> {
    try {
      // Call the Supabase function to register for the event
      const { data, error } = await supabase
        .rpc('increment_user_event_usage', {
          user_id: userId,
          event_id: eventId
        });
      
      if (error) {
        console.error('Error registering for event:', error);
        throw error;
      }
      
      if (data === false) {
        // Check why registration failed
        const { data: canRegister, error: checkError } = await supabase
          .rpc('can_register_for_event', {
            user_id: userId,
            event_id: eventId
          });
          
        if (checkError) {
          throw new Error('Failed to check registration eligibility');
        }
        
        if (canRegister === false) {
          // Get user's quota and usage
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('subscription_events_quota, subscription_events_used')
            .eq('id', userId)
            .single();
            
          if (userError) {
            throw new Error('Failed to check user subscription');
          }
          
          // Get event data
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('current_participants, max_participants')
            .eq('id', eventId)
            .single();
            
          if (eventError) {
            throw new Error('Failed to check event availability');
          }
          
          // Determine the reason for failure
          if (userData.subscription_events_used >= userData.subscription_events_quota) {
            throw new Error('You have reached your event quota. Please upgrade your subscription.');
          } else if (eventData.current_participants >= eventData.max_participants) {
            throw new Error('This event is full. Please try another event.');
          } else {
            throw new Error('Registration failed. Please try again.');
          }
        }
      }
      
      // Also update in Firebase for redundancy
      try {
        // Add registration record
        await addDoc(collection(db, 'registrations'), {
          userId,
          eventId,
          registeredAt: serverTimestamp(),
        });

        // Update event participant count
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
          currentParticipants: increment(1),
        });
      } catch (firebaseError) {
        console.error('Error updating Firebase:', firebaseError);
        // Continue even if Firebase fails - Supabase is now primary
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      // Get registrations using the new function
      const { data: registrations, error } = await supabase
        .rpc('get_user_registrations', {
          input_user_id: userId
        });
        
      if (error) {
        console.error('Error getting user registrations from Supabase:', error);
        // Fall back to Firebase
      } else if (registrations && registrations.length > 0) {
        return registrations.map(reg => ({
          id: reg.id || '',
          userId: reg.user_id || userId,
          eventId: reg.event_id || '',
          registeredAt: reg.registered_at ? new Date(reg.registered_at) : new Date()
        }));
      }
      
      // Fall back to Firebase
      const q = query(
        collection(db, 'registrations'), 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const firebaseRegistrations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          eventId: data.eventId,
          registeredAt: data.registeredAt?.toDate() || new Date(),
        };
      }) as EventRegistration[];
      
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
      // Get registrations using the new function
      const { data: registrations, error } = await supabase
        .rpc('get_event_registrations', {
          input_event_id: eventId
        });
        
      if (error) {
        console.error('Error getting event registrations from Supabase:', error);
        // Fall back to Firebase
      } else if (registrations && registrations.length > 0) {
        return registrations.map(reg => ({
          id: reg.id || '',
          userId: reg.user_id || '',
          eventId: reg.event_id || eventId,
          registeredAt: reg.registered_at ? new Date(reg.registered_at) : new Date()
        }));
      }
      
      // Fall back to Firebase
      const q = query(
        collection(db, 'registrations'), 
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      const firebaseRegistrations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          eventId: data.eventId,
          registeredAt: data.registeredAt?.toDate() || new Date(),
        };
      }) as EventRegistration[];
      
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
  },

  async canRegisterForEvent(userId: string, eventId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('can_register_for_event', {
          user_id: userId,
          event_id: eventId
        });
        
      if (error) {
        console.error('Error checking registration eligibility:', error);
        throw error;
      }
      
      return data === true;
    } catch (error) {
      console.error('Error checking if user can register:', error);
      throw error;
    }
  }
};