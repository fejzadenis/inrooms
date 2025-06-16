import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

export const linkedinService = {
  async connectLinkedIn(userId: string, accessToken: string) {
    try {
      // Get basic profile information
      const profileResponse = await fetch(`${LINKEDIN_API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const profileData = await profileResponse.json();

      // Get email address
      const emailResponse = await fetch(`${LINKEDIN_API_URL}/emailAddress?q=members&projection=(elements*(handle~))`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const emailData = await emailResponse.json();

      // Update user document with LinkedIn data
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'linkedinProfile': {
          id: profileData.id,
          email: emailData.elements[0]['handle~'].emailAddress,
          connected: true,
          lastSync: new Date(),
        },
      });

      return profileData;
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      throw error;
    }
  },

  async importLinkedInConnections(userId: string, accessToken: string) {
    try {
      const response = await fetch(`${LINKEDIN_API_URL}/connections`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const connections = await response.json();

      // Update user's connections in Firestore
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const existingConnections = userData?.connections || [];
      const linkedInConnections = connections.elements.map(conn => ({
        id: conn.id,
        name: `${conn.firstName} ${conn.lastName}`,
        title: conn.headline,
        company: conn.positions?.values?.[0]?.company?.name,
        source: 'linkedin'
      }));

      await updateDoc(userRef, {
        connections: [...existingConnections, ...linkedInConnections]
      });

      return linkedInConnections;
    } catch (error) {
      console.error('Error importing LinkedIn connections:', error);
      throw error;
    }
  },

  async syncProfile(userId: string, accessToken: string) {
    try {
      const response = await fetch(`${LINKEDIN_API_URL}/me?projection=(id,firstName,lastName,headline,positions,industry)`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const profileData = await response.json();

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'profile.title': profileData.headline,
        'profile.industry': profileData.industry,
        'profile.positions': profileData.positions.values,
        'linkedinProfile.lastSync': new Date(),
      });

      return profileData;
    } catch (error) {
      console.error('Error syncing LinkedIn profile:', error);
      throw error;
    }
  }
};