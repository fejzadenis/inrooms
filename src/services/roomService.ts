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
import type { Room, RoomParticipant, RoomFilter } from '../types/room';

export const roomService = {
  async createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        ...roomData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async updateRoom(roomId: string, roomData: Partial<Room>): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        ...roomData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  async deleteRoom(roomId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'rooms', roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  async getRooms(filter?: RoomFilter): Promise<Room[]> {
    try {
      let q;
      
      // If we have multiple filters that would require a composite index,
      // we'll fetch all rooms and filter in memory to avoid index requirements
      if (filter && Object.keys(filter).length > 1) {
        // Fetch all rooms and filter in memory
        q = query(collection(db, 'rooms'));
      } else if (filter?.roomType) {
        q = query(collection(db, 'rooms'), where('roomType', '==', filter.roomType));
      } else if (filter?.status) {
        q = query(collection(db, 'rooms'), where('status', '==', filter.status));
      } else if (filter?.hostId) {
        q = query(collection(db, 'rooms'), where('hostId', '==', filter.hostId));
      } else {
        // No filters, just get all rooms
        q = query(collection(db, 'rooms'));
      }

      const querySnapshot = await getDocs(q);
      let rooms = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Properly handle date conversion
        const scheduledStart = data.scheduledStart instanceof Timestamp ? 
          data.scheduledStart.toDate() : 
          (data.scheduledStart && typeof data.scheduledStart.toDate === 'function' ? 
            data.scheduledStart.toDate() : 
            new Date(data.scheduledStart));
            
        const scheduledEnd = data.scheduledEnd instanceof Timestamp ? 
          data.scheduledEnd.toDate() : 
          (data.scheduledEnd && typeof data.scheduledEnd.toDate === 'function' ? 
            data.scheduledEnd.toDate() : 
            new Date(data.scheduledEnd));
            
        return {
          id: doc.id,
          ...data,
          scheduledStart,
          scheduledEnd,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
        };
      }) as Room[];

      // Apply filters in memory if we fetched all rooms
      if (filter && Object.keys(filter).length > 1) {
        if (filter.roomType) {
          rooms = rooms.filter(room => room.roomType === filter.roomType);
        }
        if (filter.status) {
          rooms = rooms.filter(room => room.status === filter.status);
        }
        if (filter.hostId) {
          rooms = rooms.filter(room => room.hostId === filter.hostId);
        }
        if (filter.tags && filter.tags.length > 0) {
          rooms = rooms.filter(room => 
            filter.tags!.some(tag => room.tags.includes(tag))
          );
        }
        if (filter.dateRange) {
          rooms = rooms.filter(room => 
            room.scheduledStart >= filter.dateRange!.start && 
            room.scheduledStart <= filter.dateRange!.end
          );
        }
      }

      // Sort by scheduled start date (ascending) in memory
      rooms.sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());

      return rooms;
    } catch (error) {
      console.error('Error getting rooms:', error);
      throw error;
    }
  },

  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        return null;
      }
      
      const data = roomDoc.data();
      return {
        id: roomDoc.id,
        ...data,
        scheduledStart: data.scheduledStart?.toDate?.() || new Date(data.scheduledStart),
        scheduledEnd: data.scheduledEnd?.toDate?.() || new Date(data.scheduledEnd),
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null,
      } as Room;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  },

  async joinRoom(roomId: string, userId: string, userName: string, userPhoto?: string): Promise<void> {
    try {
      // Add participant
      await addDoc(collection(db, 'room_participants'), {
        roomId,
        userId,
        userName,
        userPhoto,
        role: 'participant',
        joinedAt: serverTimestamp(),
      });

      // Update room participant count
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        currentParticipants: increment(1),
      });
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  },

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      // Find participant record
      const q = query(
        collection(db, 'room_participants'),
        where('roomId', '==', roomId),
        where('userId', '==', userId),
        where('leftAt', '==', null)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.warn('No active participant record found');
        return;
      }
      
      // Update participant record
      const participantRef = doc(db, 'room_participants', querySnapshot.docs[0].id);
      await updateDoc(participantRef, {
        leftAt: serverTimestamp(),
      });

      // Update room participant count
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        currentParticipants: increment(-1),
      });
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  },

  async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
    try {
      const q = query(
        collection(db, 'room_participants'),
        where('roomId', '==', roomId),
        where('leftAt', '==', null)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinedAt: data.joinedAt?.toDate?.() || new Date(),
          leftAt: data.leftAt?.toDate?.() || null,
        };
      }) as RoomParticipant[];
    } catch (error) {
      console.error('Error getting room participants:', error);
      throw error;
    }
  },

  async getUserActiveRooms(userId: string): Promise<string[]> {
    try {
      const q = query(
        collection(db, 'room_participants'),
        where('userId', '==', userId),
        where('leftAt', '==', null)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data().roomId);
    } catch (error) {
      console.error('Error getting user active rooms:', error);
      throw error;
    }
  }
};