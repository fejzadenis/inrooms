import { supabase } from '../config/supabase';

export const connectionService = {
  async addConnection(userId: string, connectionId: string): Promise<void> {
    try {
      // Get current connections for both users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('connections')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: connectionData, error: connectionError } = await supabase
        .from('users')
        .select('connections')
        .eq('id', connectionId)
        .single();

      if (connectionError) throw connectionError;

      // Add connections (ensure uniqueness)
      const userConnections = new Set(userData.connections || []);
      const connectionConnections = new Set(connectionData.connections || []);

      userConnections.add(connectionId);
      connectionConnections.add(userId);

      // Update both users
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ connections: Array.from(userConnections) })
        .eq('id', userId);

      if (updateUserError) throw updateUserError;

      const { error: updateConnectionError } = await supabase
        .from('users')
        .update({ connections: Array.from(connectionConnections) })
        .eq('id', connectionId);

      if (updateConnectionError) throw updateConnectionError;
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  },

  async removeConnection(userId: string, connectionId: string): Promise<void> {
    try {
      // Get current connections for both users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('connections')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: connectionData, error: connectionError } = await supabase
        .from('users')
        .select('connections')
        .eq('id', connectionId)
        .single();

      if (connectionError) throw connectionError;

      // Remove connections
      const userConnections = (userData.connections || []).filter(id => id !== connectionId);
      const connectionConnections = (connectionData.connections || []).filter(id => id !== userId);

      // Update both users
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ connections: userConnections })
        .eq('id', userId);

      if (updateUserError) throw updateUserError;

      const { error: updateConnectionError } = await supabase
        .from('users')
        .update({ connections: connectionConnections })
        .eq('id', connectionId);

      if (updateConnectionError) throw updateConnectionError;
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },
};