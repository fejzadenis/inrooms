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
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ConnectionRequest, Notification } from '../types/connections';

export const connectionService = {
  // Send a connection request
  async sendConnectionRequest(fromUserId: string, toUserId: string, message?: string): Promise<string> {
    try {
      // Validate that both user IDs are defined
      if (!fromUserId || !toUserId) {
        throw new Error('Both fromUserId and toUserId are required');
      }

      if (fromUserId === toUserId) {
        throw new Error('Cannot send connection request to yourself');
      }

      // Check if a request already exists
      const existingRequest = await this.getConnectionRequestBetweenUsers(fromUserId, toUserId);
      if (existingRequest) {
        throw new Error('A connection request already exists between these users');
      }

      // Check if users are already connected
      const areConnected = await this.checkIfUsersAreConnected(fromUserId, toUserId);
      if (areConnected) {
        throw new Error('Users are already connected');
      }

      // Create the connection request
      const requestData = {
        fromUserId,
        toUserId,
        status: 'pending',
        message: message || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'connection_requests'), requestData);

      // Create notification for the recipient
      await this.createConnectionRequestNotification(fromUserId, toUserId, docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  },

  // Accept a connection request
  async acceptConnectionRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'connection_requests', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Connection request not found');
      }

      const requestData = requestDoc.data();
      if (requestData.status !== 'pending') {
        throw new Error('Connection request has already been processed');
      }

      const fromUserId = requestData.fromUserId;
      const toUserId = requestData.toUserId;

      // Update request status
      await updateDoc(requestRef, {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      // Add each user to the other's connections array
      const fromUserRef = doc(db, 'users', fromUserId);
      const toUserRef = doc(db, 'users', toUserId);

      await updateDoc(fromUserRef, {
        connections: arrayUnion(toUserId)
      });

      await updateDoc(toUserRef, {
        connections: arrayUnion(fromUserId)
      });

      // Create notification for the sender
      await this.createConnectionAcceptedNotification(fromUserId, toUserId);
    } catch (error) {
      console.error('Error accepting connection request:', error);
      throw error;
    }
  },

  // Reject a connection request
  async rejectConnectionRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'connection_requests', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Connection request not found');
      }

      const requestData = requestDoc.data();
      if (requestData.status !== 'pending') {
        throw new Error('Connection request has already been processed');
      }

      // Update request status
      await updateDoc(requestRef, {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      throw error;
    }
  },

  // Cancel a connection request (sender withdraws request)
  async cancelConnectionRequest(requestId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'connection_requests', requestId));
    } catch (error) {
      console.error('Error canceling connection request:', error);
      throw error;
    }
  },

  // Remove a connection
  async removeConnection(userId: string, connectionId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const connectionRef = doc(db, 'users', connectionId);

      // Remove each user from the other's connections array
      await updateDoc(userRef, {
        connections: arrayRemove(connectionId)
      });

      await updateDoc(connectionRef, {
        connections: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },

  // Get all pending connection requests for a user (both sent and received)
  async getPendingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
    try {
      // Get all connection requests without ordering to avoid index requirement
      const q = query(
        collection(db, 'connection_requests'),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const requests: ConnectionRequest[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.fromUserId === userId || data.toUserId === userId) {
          requests.push({
            id: doc.id,
            fromUserId: data.fromUserId,
            toUserId: data.toUserId,
            status: data.status,
            message: data.message || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate()
          });
        }
      });

      // Sort in memory by createdAt (most recent first)
      return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting pending connection requests:', error);
      throw error;
    }
  },

  // Get incoming connection requests for a user
  async getIncomingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
    try {
      // Simplified query without ordering to avoid index requirement
      const q = query(
        collection(db, 'connection_requests'),
        where('toUserId', '==', userId),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ConnectionRequest[];

      // Sort in memory by createdAt (most recent first)
      return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting incoming connection requests:', error);
      throw error;
    }
  },

  // Get outgoing connection requests from a user
  async getOutgoingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
    try {
      // Simplified query without ordering to avoid index requirement
      const q = query(
        collection(db, 'connection_requests'),
        where('fromUserId', '==', userId),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ConnectionRequest[];

      // Sort in memory by createdAt (most recent first)
      return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting outgoing connection requests:', error);
      throw error;
    }
  },

  // Get a specific connection request by ID
  async getConnectionRequest(requestId: string): Promise<ConnectionRequest | null> {
    try {
      const docRef = doc(db, 'connection_requests', requestId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          status: data.status,
          message: data.message || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting connection request:', error);
      throw error;
    }
  },

  // Check if a connection request exists between two users
  async getConnectionRequestBetweenUsers(userId1: string, userId2: string): Promise<ConnectionRequest | null> {
    try {
      // Validate that both user IDs are defined
      if (!userId1 || !userId2) {
        return null;
      }

      // Check for requests in both directions
      const q1 = query(
        collection(db, 'connection_requests'),
        where('fromUserId', '==', userId1),
        where('toUserId', '==', userId2)
      );

      const q2 = query(
        collection(db, 'connection_requests'),
        where('fromUserId', '==', userId2),
        where('toUserId', '==', userId1)
      );

      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      // Combine results
      const docs = [...snapshot1.docs, ...snapshot2.docs];
      
      if (docs.length > 0) {
        const data = docs[0].data();
        return {
          id: docs[0].id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          status: data.status,
          message: data.message || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking connection request between users:', error);
      throw error;
    }
  },

  // Check if two users are connected (symmetric check)
  async checkIfUsersAreConnected(userId1: string, userId2: string): Promise<boolean> {
    try {
      // Validate that both user IDs are defined
      if (!userId1 || !userId2) {
        return false;
      }

      // Get both user documents to perform symmetric check
      const [user1Doc, user2Doc] = await Promise.all([
        getDoc(doc(db, 'users', userId1)),
        getDoc(doc(db, 'users', userId2))
      ]);

      if (!user1Doc.exists() || !user2Doc.exists()) {
        return false;
      }

      const user1Data = user1Doc.data();
      const user2Data = user2Doc.data();
      
      const user1Connections = user1Data.connections || [];
      const user2Connections = user2Data.connections || [];

      // Both users must have each other in their connections for a valid connection
      return user1Connections.includes(userId2) && user2Connections.includes(userId1);
    } catch (error) {
      console.error('Error checking if users are connected:', error);
      throw error;
    }
  },

  // Get connection status between two users
  async getConnectionStatus(userId1: string, userId2: string): Promise<'connected' | 'pending_sent' | 'pending_received' | 'none'> {
    try {
      // Validate that both user IDs are defined
      if (!userId1 || !userId2) {
        return 'none';
      }

      // Check if they're already connected
      const areConnected = await this.checkIfUsersAreConnected(userId1, userId2);
      if (areConnected) {
        return 'connected';
      }

      // Check for pending requests
      const request = await this.getConnectionRequestBetweenUsers(userId1, userId2);
      if (request && request.status === 'pending') {
        return request.fromUserId === userId1 ? 'pending_sent' : 'pending_received';
      }

      return 'none';
    } catch (error) {
      console.error('Error getting connection status:', error);
      throw error;
    }
  },

  // Create a notification for a connection request
  async createConnectionRequestNotification(fromUserId: string, toUserId: string, requestId: string): Promise<void> {
    try {
      // Get sender's name
      const senderRef = doc(db, 'users', fromUserId);
      const senderDoc = await getDoc(senderRef);
      const senderName = senderDoc.exists() ? senderDoc.data().name : 'Someone';

      // Create notification
      await addDoc(collection(db, 'notifications'), {
        userId: toUserId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${senderName} wants to connect with you`,
        relatedId: requestId,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating connection request notification:', error);
      // Don't throw - notification failure shouldn't block the connection request
    }
  },

  // Create a notification for an accepted connection
  async createConnectionAcceptedNotification(toUserId: string, fromUserId: string): Promise<void> {
    try {
      // Get accepter's name
      const accepterRef = doc(db, 'users', fromUserId);
      const accepterDoc = await getDoc(accepterRef);
      const accepterName = accepterDoc.exists() ? accepterDoc.data().name : 'Someone';

      // Create notification
      await addDoc(collection(db, 'notifications'), {
        userId: toUserId,
        type: 'connection_accepted',
        title: 'Connection Request Accepted',
        message: `${accepterName} accepted your connection request`,
        relatedId: fromUserId,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating connection accepted notification:', error);
      // Don't throw - notification failure shouldn't block the connection acceptance
    }
  },

  // Get user's notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      // Simplified query without ordering to avoid index requirement
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Notification[];

      // Sort in memory by createdAt (most recent first)
      return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};