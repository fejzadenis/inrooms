import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { connectionService } from './connectionService';

export interface NetworkProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  profile_title?: string;
  profile_company?: string;
  profile_location?: string;
  profile_about?: string;
  profile_skills?: string[];
  photo_url?: string;
  connections?: string[];
  connectionStatus?: 'connected' | 'pending_sent' | 'pending_received' | 'none';
}

export const networkService = {
  // Get all users for networking (excluding current user)
  async getNetworkUsers(currentUserId: string): Promise<NetworkProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        limit(100)
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'user',
            profile_title: data.profile?.title || '',
            profile_company: data.profile?.company || '',
            profile_location: data.profile?.location || '',
            profile_about: data.profile?.about || '',
            profile_skills: data.profile?.skills || [],
            photo_url: data.photoURL || '',
            connections: data.connections || []
          } as NetworkProfile;
        })
        .filter(user => user.id !== currentUserId);

      // Add connection status for each user
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const status = await connectionService.getConnectionStatus(currentUserId, user.id);
          return {
            ...user,
            connectionStatus: status
          };
        })
      );

      return usersWithStatus;
    } catch (error) {
      console.error('Error getting network users:', error);
      throw error;
    }
  },

  // Get user's connections
  async getUserConnections(userId: string): Promise<string[]> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().connections || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting user connections:', error);
      throw error;
    }
  },

  // Get user's connection profiles
  async getUserConnectionProfiles(userId: string): Promise<NetworkProfile[]> {
    try {
      // Get user's connections
      const connections = await this.getUserConnections(userId);
      
      if (connections.length === 0) {
        return [];
      }
      
      // Get profiles for each connection
      const connectionProfiles: NetworkProfile[] = [];
      
      // Process in batches to avoid excessive reads
      const batchSize = 10;
      for (let i = 0; i < connections.length; i += batchSize) {
        const batch = connections.slice(i, i + batchSize);
        const batchPromises = batch.map(async (connectionId) => {
          const userRef = doc(db, 'users', connectionId);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            return {
              id: userDoc.id,
              name: data.name || '',
              email: data.email || '',
              role: data.role || 'user',
              profile_title: data.profile?.title || '',
              profile_company: data.profile?.company || '',
              profile_location: data.profile?.location || '',
              profile_about: data.profile?.about || '',
              profile_skills: data.profile?.skills || [],
              photo_url: data.photoURL || '',
              connections: data.connections || [],
              connectionStatus: 'connected' as const
            };
          }
          return null;
        });
        
        const batchResults = await Promise.all(batchPromises);
        connectionProfiles.push(...batchResults.filter(Boolean) as NetworkProfile[]);
      }
      
      return connectionProfiles;
    } catch (error) {
      console.error('Error getting user connection profiles:', error);
      throw error;
    }
  },

  // Add a connection
  async addConnection(userId: string, targetUserId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Add to both users' connections arrays
      await Promise.all([
        updateDoc(userRef, {
          connections: arrayUnion(targetUserId),
          updatedAt: serverTimestamp()
        }),
        updateDoc(targetUserRef, {
          connections: arrayUnion(userId),
          updatedAt: serverTimestamp()
        })
      ]);

    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  },

  // Remove a connection
  async removeConnection(userId: string, targetUserId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Remove from both users' connections arrays
      await Promise.all([
        updateDoc(userRef, {
          connections: arrayRemove(targetUserId),
          updatedAt: serverTimestamp()
        }),
        updateDoc(targetUserRef, {
          connections: arrayRemove(userId),
          updatedAt: serverTimestamp()
        })
      ]);

    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },

  // Search users by name, company, or title
  async searchUsers(searchTerm: string, currentUserId: string): Promise<NetworkProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(50));

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'user',
            profile_title: data.profile?.title || '',
            profile_company: data.profile?.company || '',
            profile_location: data.profile?.location || '',
            profile_about: data.profile?.about || '',
            profile_skills: data.profile?.skills || [],
            photo_url: data.photoURL || '',
            connections: data.connections || []
          } as NetworkProfile;
        })
        .filter(user => {
          if (user.id === currentUserId) return false;
          
          const searchLower = searchTerm.toLowerCase();
          return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.profile_company?.toLowerCase().includes(searchLower) ||
            user.profile_title?.toLowerCase().includes(searchLower) ||
            user.profile_skills?.some(skill => skill.toLowerCase().includes(searchLower))
          );
        });

      // Add connection status for each user
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const status = await connectionService.getConnectionStatus(currentUserId, user.id);
          return {
            ...user,
            connectionStatus: status
          };
        })
      );

      return usersWithStatus;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Get recommended connections for a user
  async getRecommendedConnections(userId: string): Promise<NetworkProfile[]> {
    try {
      // Get user's current connections
      const userConnections = await this.getUserConnections(userId);
      
      // Get user's profile to find matching interests/skills
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const userSkills = userData.profile?.skills || [];
      const userIndustry = userData.profile?.industry || '';
      
      // Query users with similar skills or industry
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(50));
      
      const snapshot = await getDocs(q);
      
      // Filter and score potential connections
      const potentialConnections = snapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Skip if it's the current user or already connected
          if (doc.id === userId || userConnections.includes(doc.id)) {
            return null;
          }
          
          const profileSkills = data.profile?.skills || [];
          const profileIndustry = data.profile?.industry || '';
          
          // Calculate match score
          let score = 0;
          
          // Score based on shared skills
          const sharedSkills = profileSkills.filter((skill: string) => 
            userSkills.includes(skill)
          );
          score += sharedSkills.length * 2;
          
          // Score based on industry match
          if (userIndustry && profileIndustry && userIndustry === profileIndustry) {
            score += 5;
          }
          
          // Score based on company size match
          if (userData.profile?.companySize && data.profile?.companySize && 
              userData.profile.companySize === data.profile.companySize) {
            score += 3;
          }
          
          // Score based on experience level match
          if (userData.profile?.experienceLevel && data.profile?.experienceLevel && 
              userData.profile.experienceLevel === data.profile.experienceLevel) {
            score += 2;
          }
          
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'user',
            profile_title: data.profile?.title || '',
            profile_company: data.profile?.company || '',
            profile_location: data.profile?.location || '',
            profile_about: data.profile?.about || '',
            profile_skills: data.profile?.skills || [],
            photo_url: data.photoURL || '',
            connections: data.connections || [],
            matchScore: score
          };
        })
        .filter(Boolean) as (NetworkProfile & { matchScore: number })[];
      
      // Sort by match score and limit to top 10
      const sortedConnections = potentialConnections
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);
      
      // Add connection status for each recommendation
      const recommendationsWithStatus = await Promise.all(
        sortedConnections.map(async (user) => {
          const status = await connectionService.getConnectionStatus(userId, user.id);
          return {
            ...user,
            connectionStatus: status
          };
        })
      );
      
      return recommendationsWithStatus;
    } catch (error) {
      console.error('Error getting recommended connections:', error);
      throw error;
    }
  }
};