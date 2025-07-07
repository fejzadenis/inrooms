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
  limit,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Demo, DemoRegistration, DemoFilter } from '../types/demo';

export const demoService = {
  async createDemo(demoData: Omit<Demo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'demos'), {
        ...demoData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating demo:', error);
      throw error;
    }
  },

  async updateDemo(demoId: string, demoData: Partial<Demo>): Promise<void> {
    try {
      const demoRef = doc(db, 'demos', demoId);
      await updateDoc(demoRef, {
        ...demoData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating demo:', error);
      throw error;
    }
  },

  async deleteDemo(demoId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'demos', demoId));
    } catch (error) {
      console.error('Error deleting demo:', error);
      throw error;
    }
  },

  async getDemos(filter?: DemoFilter): Promise<Demo[]> {
    try {
      let q;
      
      // If we have multiple filters that would require a composite index,
      // we'll fetch all demos and filter in memory to avoid index requirements
      if (filter && Object.keys(filter).length > 1) {
        // Fetch all demos and filter in memory
        q = query(collection(db, 'demos'));
      } else if (filter?.isPublic !== undefined) {
        // Single filter queries that don't require composite indexes
        q = query(collection(db, 'demos'), where('isPublic', '==', filter.isPublic));
      } else if (filter?.isFeatured !== undefined) {
        q = query(collection(db, 'demos'), where('isFeatured', '==', filter.isFeatured));
      } else if (filter?.status) {
        q = query(collection(db, 'demos'), where('status', '==', filter.status));
      } else if (filter?.hostId) {
        q = query(collection(db, 'demos'), where('hostId', '==', filter.hostId));
      } else {
        // No filters, just get all demos
        q = query(collection(db, 'demos'));
      }

      const querySnapshot = await getDocs(q);
      let demos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Properly handle date conversion
        const scheduledDate = data.scheduledDate instanceof Timestamp ? 
          data.scheduledDate.toDate() : 
          (data.scheduledDate && typeof data.scheduledDate.toDate === 'function' ? 
            data.scheduledDate.toDate() : 
            new Date(data.scheduledDate));
            
        return {
          id: doc.id,
          ...data,
          scheduledDate: scheduledDate,
          recordingUploadedAt: data.recordingUploadedAt?.toDate?.() || null,
          visibilityExpiresAt: data.visibilityExpiresAt?.toDate?.() || null,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
        };
      }) as Demo[];

      // Apply filters in memory if we fetched all demos
      if (filter && Object.keys(filter).length > 1) {
        if (filter.isPublic !== undefined) {
          demos = demos.filter(demo => demo.isPublic === filter.isPublic);
        }
        if (filter.isFeatured !== undefined) {
          demos = demos.filter(demo => demo.isFeatured === filter.isFeatured);
        }
        if (filter.status) {
          demos = demos.filter(demo => demo.status === filter.status);
        }
        if (filter.hostId) {
          demos = demos.filter(demo => demo.hostId === filter.hostId);
        }
      }

      // Sort by scheduled date (descending) in memory
      demos.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

      return demos;
    } catch (error) {
      console.error('Error getting demos:', error);
      throw error;
    }
  },

  async getFeaturedDemos(): Promise<Demo[]> {
    try {
      // Use separate queries to avoid composite index requirements
      const q = query(
        collection(db, 'demos'),
        where('isFeatured', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      let demos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Properly handle date conversion
        const scheduledDate = data.scheduledDate instanceof Timestamp ? 
          data.scheduledDate.toDate() : 
          (data.scheduledDate && typeof data.scheduledDate.toDate === 'function' ? 
            data.scheduledDate.toDate() : 
            new Date(data.scheduledDate));
            
        return {
          id: doc.id,
          ...data,
          scheduledDate: scheduledDate,
          recordingUploadedAt: data.recordingUploadedAt?.toDate?.() || null,
          visibilityExpiresAt: data.visibilityExpiresAt?.toDate?.() || null,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
        };
      }) as Demo[];

      // Filter for public demos and sort in memory
      demos = demos
        .filter(demo => demo.isPublic)
        .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
        .slice(0, 6); // Limit to 6 results

      return demos;
    } catch (error) {
      console.error('Error getting featured demos:', error);
      throw error;
    }
  },

  async registerForDemo(userId: string, demoId: string, userInfo: {
    userName: string;
    userEmail: string;
    userCompany?: string;
  }): Promise<void> {
    try {
      // Add registration
      await addDoc(collection(db, 'demo_registrations'), {
        demoId,
        userId,
        userName: userInfo.userName,
        userEmail: userInfo.userEmail,
        userCompany: userInfo.userCompany,
        registeredAt: serverTimestamp(),
      });

      // Update demo attendee count
      const demoRef = doc(db, 'demos', demoId);
      await updateDoc(demoRef, {
        currentAttendees: increment(1),
      });
    } catch (error) {
      console.error('Error registering for demo:', error);
      throw error;
    }
  },

  async getUserDemoRegistrations(userId: string): Promise<DemoRegistration[]> {
    try {
      const q = query(
        collection(db, 'demo_registrations'), 
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
      }) as DemoRegistration[];
    } catch (error) {
      console.error('Error getting user demo registrations:', error);
      throw error;
    }
  },

  async getDemoRegistrations(demoId: string): Promise<DemoRegistration[]> {
    try {
      const q = query(
        collection(db, 'demo_registrations'), 
        where('demoId', '==', demoId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate?.() || new Date(),
        };
      }) as DemoRegistration[];
    } catch (error) {
      console.error('Error getting demo registrations:', error);
      throw error;
    }
  },

  async uploadRecording(demoId: string, recordingData: {
    recordingUrl: string;
    recordingDuration: number;
    thumbnailUrl?: string;
    visibilityDuration?: number;
  }): Promise<void> {
    try {
      const demoRef = doc(db, 'demos', demoId);
      
      // Get the demo to check the host's subscription status
      const demoDoc = await getDoc(demoRef);
      if (!demoDoc.exists()) {
        throw new Error('Demo not found');
      }
      
      const demoData = demoDoc.data();
      const hostId = demoData.hostId;
      
      // Get the host's user data to check subscription
      const hostRef = doc(db, 'users', hostId);
      const hostDoc = await getDoc(hostRef);
      
      let visibilityDuration = recordingData.visibilityDuration;
      let visibilityExpiresAt = null;
      
      if (hostDoc.exists()) {
        const hostData = hostDoc.data();
        
        // Adjust visibility based on subscription
        if (hostData.role === 'admin' || hostData.subscription?.status === 'active') {
          // Enterprise or admin users can set any visibility duration
          visibilityDuration = recordingData.visibilityDuration || 365; // Default to 1 year if not specified
        } else if (hostData.subscription?.status === 'trial') {
          // Trial users get max 7 days
          visibilityDuration = Math.min(recordingData.visibilityDuration || 7, 7);
        } else {
          // Standard users get max 30 days
          visibilityDuration = Math.min(recordingData.visibilityDuration || 30, 30);
        }
      }
      
      // Calculate expiry date if visibility duration is set
      if (visibilityDuration) {
        visibilityExpiresAt = new Date();
        visibilityExpiresAt.setDate(visibilityExpiresAt.getDate() + visibilityDuration);
      }

      await updateDoc(demoRef, {
        recordingUrl: recordingData.recordingUrl,
        recordingDuration: recordingData.recordingDuration,
        thumbnailUrl: recordingData.thumbnailUrl,
        visibilityDuration: visibilityDuration,
        visibilityExpiresAt: visibilityExpiresAt,
        recordingUploadedAt: serverTimestamp(),
        status: 'completed',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  },

  async toggleFeaturedStatus(demoId: string, isFeatured: boolean): Promise<void> {
    try {
      const demoRef = doc(db, 'demos', demoId);
      await updateDoc(demoRef, {
        isFeatured,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  },

  async getRecordingVisibility(demo: Demo): Promise<boolean> {
    if (!demo.recordingUrl) return false;
    if (!demo.visibilityExpiresAt) return true;
    
    return new Date() < demo.visibilityExpiresAt;
  },

  async extendRecordingVisibility(demoId: string, additionalDays: number): Promise<void> {
    try {
      const demoRef = doc(db, 'demos', demoId);
      const demoDoc = await getDoc(demoRef);
      
      if (demoDoc.exists()) {
        const data = demoDoc.data();
        const currentExpiry = data.visibilityExpiresAt?.toDate?.() || new Date();
        const newExpiry = new Date(currentExpiry.getTime() + additionalDays * 24 * 60 * 60 * 1000);
        
        await updateDoc(demoRef, {
          visibilityExpiresAt: newExpiry,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error extending recording visibility:', error);
      throw error;
    }
  }
};