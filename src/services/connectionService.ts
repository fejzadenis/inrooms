import { supabase } from '../config/supabase';
import type { ConnectionRequest, Notification } from '../types/connections';

export const connectionService = {
  // Send a connection request
  async sendConnectionRequest(fromUserId: string, toUserId: string, message?: string): Promise<string> {
    try {
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
      const { data, error } = await supabase
        .from('connection_requests')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          status: 'pending',
          message: message || '',
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for the recipient
      await this.createConnectionRequestNotification(fromUserId, toUserId, data.id);

      return data.id;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  },

  // Accept a connection request
  async acceptConnectionRequest(requestId: string): Promise<void> {
    try {
      // Get the connection request
      const { data: request, error: fetchError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;
      if (!request) throw new Error('Connection request not found');
      if (request.status !== 'pending') {
        throw new Error('Connection request has already been processed');
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('connection_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add each user to the other's connections array
      const { error: fromUserError } = await supabase
        .from('users')
        .update({
          connections: supabase.rpc('array_append', {
            arr: 'connections',
            elem: request.to_user_id
          })
        })
        .eq('id', request.from_user_id);

      if (fromUserError) {
        // Fallback: get current connections and append
        const { data: fromUser } = await supabase
          .from('users')
          .select('connections')
          .eq('id', request.from_user_id)
          .single();

        const fromConnections = fromUser?.connections || [];
        if (!fromConnections.includes(request.to_user_id)) {
          await supabase
            .from('users')
            .update({ connections: [...fromConnections, request.to_user_id] })
            .eq('id', request.from_user_id);
        }
      }

      const { error: toUserError } = await supabase
        .from('users')
        .update({
          connections: supabase.rpc('array_append', {
            arr: 'connections',
            elem: request.from_user_id
          })
        })
        .eq('id', request.to_user_id);

      if (toUserError) {
        // Fallback: get current connections and append
        const { data: toUser } = await supabase
          .from('users')
          .select('connections')
          .eq('id', request.to_user_id)
          .single();

        const toConnections = toUser?.connections || [];
        if (!toConnections.includes(request.from_user_id)) {
          await supabase
            .from('users')
            .update({ connections: [...toConnections, request.from_user_id] })
            .eq('id', request.to_user_id);
        }
      }

      // Create notification for the sender
      await this.createConnectionAcceptedNotification(request.from_user_id, request.to_user_id);
    } catch (error) {
      console.error('Error accepting connection request:', error);
      throw error;
    }
  },

  // Reject a connection request
  async rejectConnectionRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('connection_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      throw error;
    }
  },

  // Cancel a connection request (sender withdraws request)
  async cancelConnectionRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('connection_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling connection request:', error);
      throw error;
    }
  },

  // Remove a connection
  async removeConnection(userId: string, connectionId: string): Promise<void> {
    try {
      // Get current connections for both users
      const { data: user1 } = await supabase
        .from('users')
        .select('connections')
        .eq('id', userId)
        .single();

      const { data: user2 } = await supabase
        .from('users')
        .select('connections')
        .eq('id', connectionId)
        .single();

      // Remove each user from the other's connections array
      if (user1?.connections) {
        const updatedConnections1 = user1.connections.filter((id: string) => id !== connectionId);
        await supabase
          .from('users')
          .update({ connections: updatedConnections1 })
          .eq('id', userId);
      }

      if (user2?.connections) {
        const updatedConnections2 = user2.connections.filter((id: string) => id !== userId);
        await supabase
          .from('users')
          .update({ connections: updatedConnections2 })
          .eq('id', connectionId);
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },

  // Get all pending connection requests for a user (both sent and received)
  async getPendingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
    try {
      // Get both incoming and outgoing requests efficiently
      const [incoming, outgoing] = await Promise.all([
        this.getIncomingConnectionRequests(userId),
        this.getOutgoingConnectionRequests(userId)
      ]);

      // Combine and sort by creation date
      const allRequests = [...incoming, ...outgoing];
      return allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting pending connection requests:', error);
      throw error;
    }
  },

  // Get incoming connection requests for a user
  async getIncomingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('to_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(request => ({
        id: request.id,
        fromUserId: request.from_user_id,
        toUserId: request.to_user_id,
        status: request.status,
        message: request.message || '',
        createdAt: new Date(request.created_at),
        updatedAt: request.updated_at ? new Date(request.updated_at) : undefined
      }));
    } catch (error) {
      console.error('Error getting incoming connection requests:', error);
      throw error;
    }
  },

  // Get outgoing connection requests from a user
  async getOutgoingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('from_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(request => ({
        id: request.id,
        fromUserId: request.from_user_id,
        toUserId: request.to_user_id,
        status: request.status,
        message: request.message || '',
        createdAt: new Date(request.created_at),
        updatedAt: request.updated_at ? new Date(request.updated_at) : undefined
      }));
    } catch (error) {
      console.error('Error getting outgoing connection requests:', error);
      throw error;
    }
  },

  // Get a specific connection request by ID
  async getConnectionRequest(requestId: string): Promise<ConnectionRequest | null> {
    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return {
        id: data.id,
        fromUserId: data.from_user_id,
        toUserId: data.to_user_id,
        status: data.status,
        message: data.message || '',
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
      };
    } catch (error) {
      console.error('Error getting connection request:', error);
      throw error;
    }
  },

  // Check if a connection request exists between two users
  async getConnectionRequestBetweenUsers(userId1: string, userId2: string): Promise<ConnectionRequest | null> {
    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select('*')
        .or(`and(from_user_id.eq.${userId1},to_user_id.eq.${userId2}),and(from_user_id.eq.${userId2},to_user_id.eq.${userId1})`)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return {
        id: data.id,
        fromUserId: data.from_user_id,
        toUserId: data.to_user_id,
        status: data.status,
        message: data.message || '',
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
      };
    } catch (error) {
      console.error('Error checking connection request between users:', error);
      return null;
    }
  },

  // Check if two users are connected
  async checkIfUsersAreConnected(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('connections')
        .eq('id', userId1)
        .single();

      if (error) throw error;

      const connections = data?.connections || [];
      return connections.includes(userId2);
    } catch (error) {
      console.error('Error checking if users are connected:', error);
      return false;
    }
  },

  // Get connection status between two users
  async getConnectionStatus(userId1: string, userId2: string): Promise<'connected' | 'pending_sent' | 'pending_received' | 'none'> {
    try {
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
      return 'none';
    }
  },

  // Create a notification for a connection request
  async createConnectionRequestNotification(fromUserId: string, toUserId: string, requestId: string): Promise<void> {
    try {
      // Get sender's name
      const { data: sender } = await supabase
        .from('users')
        .select('name')
        .eq('id', fromUserId)
        .single();

      const senderName = sender?.name || 'Someone';

      // Create notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: toUserId,
          type: 'connection_request',
          title: 'New Connection Request',
          message: `${senderName} wants to connect with you`,
          related_id: requestId,
          read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating connection request notification:', error);
      // Don't throw - notification failure shouldn't block the connection request
    }
  },

  // Create a notification for an accepted connection
  async createConnectionAcceptedNotification(toUserId: string, fromUserId: string): Promise<void> {
    try {
      // Get accepter's name
      const { data: accepter } = await supabase
        .from('users')
        .select('name')
        .eq('id', fromUserId)
        .single();

      const accepterName = accepter?.name || 'Someone';

      // Create notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: toUserId,
          type: 'connection_accepted',
          title: 'Connection Request Accepted',
          message: `${accepterName} accepted your connection request`,
          related_id: fromUserId,
          read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating connection accepted notification:', error);
      // Don't throw - notification failure shouldn't block the connection acceptance
    }
  },

  // Get user's notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedId: notification.related_id,
        read: notification.read,
        createdAt: new Date(notification.created_at)
      }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};