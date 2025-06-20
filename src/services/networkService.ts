import { supabase } from '../config/supabase';

export interface NetworkProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  profile_title?: string;
  profile_company?: string;
  profile_location?: string;
  profile_skills?: string[];
  profile_about?: string;
  photo_url?: string;
  connections?: string[];
  profile_points?: number;
}

export interface Connection {
  id?: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export const networkService = {
  // Get all users for networking (excluding current user)
  async getNetworkUsers(currentUserId: string): Promise<NetworkProfile[]> {
    try {
      // Query users table with public profile access
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          profile_title,
          profile_company,
          profile_location,
          profile_skills,
          profile_about,
          photo_url,
          connections,
          profile_points
        `)
        .neq('id', currentUserId)
        .eq('role', 'user')
        .limit(50);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return users || [];
    } catch (error) {
      console.error('Error getting network users:', error);
      throw error;
    }
  },

  // Get user's connections
  async getUserConnections(userId: string): Promise<string[]> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('connections')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error getting user connections:', error);
        throw error;
      }

      return user?.connections || [];
    } catch (error) {
      console.error('Error getting user connections:', error);
      throw error;
    }
  },

  // Add a connection
  async addConnection(userId: string, targetUserId: string): Promise<void> {
    try {
      // Get current connections for both users
      const { data: currentUser } = await supabase
        .from('users')
        .select('connections')
        .eq('id', userId)
        .single();

      const { data: targetUser } = await supabase
        .from('users')
        .select('connections')
        .eq('id', targetUserId)
        .single();

      const userConnections = currentUser?.connections || [];
      const targetUserConnections = targetUser?.connections || [];

      // Add to connections if not already connected
      if (!userConnections.includes(targetUserId)) {
        userConnections.push(targetUserId);
      }
      if (!targetUserConnections.includes(userId)) {
        targetUserConnections.push(userId);
      }

      // Update both users' connections
      const { error: userError } = await supabase
        .from('users')
        .update({ connections: userConnections })
        .eq('id', userId);

      const { error: targetError } = await supabase
        .from('users')
        .update({ connections: targetUserConnections })
        .eq('id', targetUserId);

      if (userError || targetError) {
        throw userError || targetError;
      }

    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  },

  // Remove a connection
  async removeConnection(userId: string, targetUserId: string): Promise<void> {
    try {
      // Get current connections for both users
      const { data: currentUser } = await supabase
        .from('users')
        .select('connections')
        .eq('id', userId)
        .single();

      const { data: targetUser } = await supabase
        .from('users')
        .select('connections')
        .eq('id', targetUserId)
        .single();

      const userConnections = (currentUser?.connections || []).filter((id: string) => id !== targetUserId);
      const targetUserConnections = (targetUser?.connections || []).filter((id: string) => id !== userId);

      // Update both users' connections
      const { error: userError } = await supabase
        .from('users')
        .update({ connections: userConnections })
        .eq('id', userId);

      const { error: targetError } = await supabase
        .from('users')
        .update({ connections: targetUserConnections })
        .eq('id', targetUserId);

      if (userError || targetError) {
        throw userError || targetError;
      }

    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },

  // Get connection recommendations based on skills
  async getConnectionRecommendations(userId: string, userSkills: string[]): Promise<NetworkProfile[]> {
    try {
      let recommendations: NetworkProfile[] = [];

      if (userSkills.length > 0) {
        // Get users with similar skills using overlap operator
        const { data: users, error } = await supabase
          .from('users')
          .select(`
            id,
            name,
            email,
            role,
            profile_title,
            profile_company,
            profile_location,
            profile_skills,
            profile_about,
            photo_url,
            connections,
            profile_points
          `)
          .neq('id', userId)
          .eq('role', 'user')
          .overlaps('profile_skills', userSkills)
          .limit(20);

        if (error) {
          console.error('Error getting skill-based recommendations:', error);
        } else {
          recommendations = users || [];
        }
      }

      // If not enough recommendations, get random users
      if (recommendations.length < 10) {
        const { data: additionalUsers, error } = await supabase
          .from('users')
          .select(`
            id,
            name,
            email,
            role,
            profile_title,
            profile_company,
            profile_location,
            profile_skills,
            profile_about,
            photo_url,
            connections,
            profile_points
          `)
          .neq('id', userId)
          .eq('role', 'user')
          .limit(20);

        if (!error && additionalUsers) {
          const filteredUsers = additionalUsers.filter(user => 
            !recommendations.some(rec => rec.id === user.id)
          );
          recommendations = [...recommendations, ...filteredUsers].slice(0, 10);
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting connection recommendations:', error);
      throw error;
    }
  },

  // Search users by name, company, or title
  async searchUsers(searchTerm: string, currentUserId: string): Promise<NetworkProfile[]> {
    try {
      const searchLower = searchTerm.toLowerCase();
      
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          profile_title,
          profile_company,
          profile_location,
          profile_skills,
          profile_about,
          photo_url,
          connections,
          profile_points
        `)
        .neq('id', currentUserId)
        .eq('role', 'user')
        .or(`name.ilike.%${searchTerm}%,profile_company.ilike.%${searchTerm}%,profile_title.ilike.%${searchTerm}%`)
        .limit(50);

      if (error) {
        console.error('Supabase search error:', error);
        throw error;
      }

      return users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};