import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface OnboardingData {
  // Professional Background
  yearsExperience?: number;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  previousCompanies?: string;
  specializations?: string[];
  certifications?: string;
  
  // Goals & Motivations
  primaryGoal?: 'networking' | 'learning' | 'career_growth' | 'business_development' | 'mentoring';
  careerAspirations?: string;
  currentChallenges?: string[];
  valueProposition?: string;
  achievements?: string;
  
  // Networking & Communication
  networkingStyle?: 'introvert' | 'extrovert' | 'ambivert';
  communicationPreference?: 'direct' | 'collaborative' | 'analytical' | 'creative';
  interests?: string[];
  eventPreferences?: string[];
  
  // Availability & Preferences
  availability?: 'very_active' | 'moderately_active' | 'occasional';
  timeZone?: string;
  preferredMeetingTimes?: string[];
  
  // Assigned Role
  assignedRole?: string;
  completedAt?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  recommendedEvents: string[];
  suggestedConnections: string[];
}

export const onboardingService = {
  async completeOnboarding(userId: string, onboardingData: OnboardingData): Promise<void> {
    try {
      console.log("ONBOARDING DEBUG: Completing onboarding for user", userId);
      const userRef = doc(db, 'users', userId);
      
      // Prepare update data with safe defaults for all fields
      const updateData: any = {
        updatedAt: serverTimestamp(),
        isNewUser: false, // Explicitly set isNewUser to false when onboarding is completed
      };

      // Professional Background - with safe defaults
      if (onboardingData.yearsExperience !== undefined) {
        updateData['profile.yearsExperience'] = onboardingData.yearsExperience;
      }
      if (onboardingData.experienceLevel) {
        updateData['profile.experienceLevel'] = onboardingData.experienceLevel;
      }
      if (onboardingData.industry) {
        updateData['profile.industry'] = onboardingData.industry;
      }
      if (onboardingData.companySize) {
        updateData['profile.companySize'] = onboardingData.companySize;
      }
      if (onboardingData.previousCompanies !== undefined) {
        updateData['profile.previousCompanies'] = onboardingData.previousCompanies || '';
      }
      if (onboardingData.specializations) {
        updateData['profile.specializations'] = onboardingData.specializations;
      }
      if (onboardingData.certifications !== undefined) {
        updateData['profile.certifications'] = onboardingData.certifications || '';
      }
      
      // Goals & Motivations - with safe defaults
      if (onboardingData.primaryGoal) {
        updateData['profile.primaryGoal'] = onboardingData.primaryGoal;
      }
      if (onboardingData.careerAspirations) {
        updateData['profile.careerAspirations'] = onboardingData.careerAspirations;
      }
      if (onboardingData.currentChallenges) {
        updateData['profile.currentChallenges'] = onboardingData.currentChallenges;
      }
      if (onboardingData.valueProposition) {
        updateData['profile.valueProposition'] = onboardingData.valueProposition;
      }
      if (onboardingData.achievements !== undefined) {
        updateData['profile.achievements'] = onboardingData.achievements || '';
      }
      
      // Networking & Communication - with safe defaults
      if (onboardingData.networkingStyle) {
        updateData['profile.networkingStyle'] = onboardingData.networkingStyle;
      }
      if (onboardingData.communicationPreference) {
        updateData['profile.communicationPreference'] = onboardingData.communicationPreference;
      }
      if (onboardingData.interests) {
        updateData['profile.interests'] = onboardingData.interests;
      }
      if (onboardingData.eventPreferences) {
        updateData['profile.eventPreferences'] = onboardingData.eventPreferences;
      }
      
      // Availability & Preferences - with safe defaults
      if (onboardingData.availability) {
        updateData['profile.availability'] = onboardingData.availability;
      }
      if (onboardingData.timeZone) {
        updateData['profile.timeZone'] = onboardingData.timeZone;
      }
      if (onboardingData.preferredMeetingTimes) {
        updateData['profile.preferredMeetingTimes'] = onboardingData.preferredMeetingTimes;
      }
      
      // Assigned Role & Completion - with safe defaults
      if (onboardingData.assignedRole) {
        updateData['profile.assignedRole'] = onboardingData.assignedRole;
        console.log("ONBOARDING DEBUG: Setting assigned role", onboardingData.assignedRole);
      }
      updateData['profile.onboardingCompleted'] = true;
      console.log("ONBOARDING DEBUG: Setting onboardingCompleted to true");
      if (onboardingData.completedAt) {
        updateData['profile.onboardingCompletedAt'] = onboardingData.completedAt;
      }

      await updateDoc(userRef, updateData);
      console.log("ONBOARDING DEBUG: Onboarding completed successfully");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  },

  async updateUserRole(userId: string, roleId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'profile.assignedRole': roleId,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // AI-powered role assignment logic
  assignRole(data: OnboardingData): string {
    const scores: Record<string, number> = {
      enterprise_closer: 0,
      startup_hustler: 0,
      saas_specialist: 0,
      relationship_builder: 0,
      sales_leader: 0,
      technical_seller: 0
    };

    // Score based on experience level
    switch (data.experienceLevel) {
      case 'executive':
        scores.sales_leader += 4;
        scores.enterprise_closer += 3;
        break;
      case 'senior':
        scores.sales_leader += 2;
        scores.enterprise_closer += 2;
        scores.relationship_builder += 2;
        break;
      case 'mid':
        scores.saas_specialist += 2;
        scores.startup_hustler += 2;
        break;
      case 'entry':
        scores.startup_hustler += 3;
        scores.saas_specialist += 1;
        break;
    }

    // Score based on primary goal
    switch (data.primaryGoal) {
      case 'networking':
        scores.relationship_builder += 4;
        break;
      case 'business_development':
        scores.enterprise_closer += 3;
        scores.startup_hustler += 2;
        break;
      case 'career_growth':
        scores.sales_leader += 3;
        break;
      case 'mentoring':
        scores.sales_leader += 4;
        break;
      case 'learning':
        scores.saas_specialist += 2;
        scores.technical_seller += 2;
        break;
    }

    // Score based on industry
    if (data.industry?.includes('Software') || data.industry?.includes('Technology')) {
      scores.saas_specialist += 3;
      scores.technical_seller += 2;
    }
    if (data.industry?.includes('Financial') || data.industry?.includes('Healthcare')) {
      scores.enterprise_closer += 3;
    }

    // Score based on specializations
    data.specializations?.forEach(spec => {
      if (spec.includes('Enterprise')) scores.enterprise_closer += 2;
      if (spec.includes('Technical') || spec.includes('Engineering')) scores.technical_seller += 3;
      if (spec.includes('Customer Success') || spec.includes('Account Management')) scores.relationship_builder += 2;
      if (spec.includes('Business Development')) scores.startup_hustler += 2;
      if (spec.includes('Sales Operations') || spec.includes('Revenue Operations')) scores.sales_leader += 2;
    });

    // Score based on communication preference
    switch (data.communicationPreference) {
      case 'analytical':
        scores.technical_seller += 3;
        scores.enterprise_closer += 2;
        break;
      case 'collaborative':
        scores.relationship_builder += 3;
        scores.sales_leader += 2;
        break;
      case 'direct':
        scores.startup_hustler += 3;
        scores.enterprise_closer += 1;
        break;
      case 'creative':
        scores.startup_hustler += 2;
        scores.saas_specialist += 2;
        break;
    }

    // Score based on networking style
    switch (data.networkingStyle) {
      case 'extrovert':
        scores.startup_hustler += 2;
        scores.sales_leader += 2;
        break;
      case 'introvert':
        scores.technical_seller += 2;
        scores.saas_specialist += 1;
        break;
      case 'ambivert':
        scores.relationship_builder += 2;
        scores.enterprise_closer += 1;
        break;
    }

    // Find the role with the highest score
    const topRole = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    return topRole[0];
  },

  // Generate personalized recommendations based on role and preferences
  generateRecommendations(data: OnboardingData, roleId: string) {
    const recommendations = {
      events: [] as string[],
      connections: [] as string[],
      resources: [] as string[]
    };

    // Event recommendations based on role
    switch (roleId) {
      case 'enterprise_closer':
        recommendations.events = [
          'Enterprise Sales Strategy Workshop',
          'C-Level Networking Mixer',
          'Account-Based Selling Masterclass',
          'Strategic Partnership Forum'
        ];
        break;
      case 'startup_hustler':
        recommendations.events = [
          'Startup Founder Networking',
          'Growth Hacking Workshop',
          'Pitch Practice Session',
          'Early-Stage Sales Strategies'
        ];
        break;
      case 'saas_specialist':
        recommendations.events = [
          'SaaS Metrics Deep Dive',
          'Product-Led Growth Workshop',
          'Subscription Model Optimization',
          'Customer Success Strategies'
        ];
        break;
      case 'relationship_builder':
        recommendations.events = [
          'Relationship Building Workshop',
          'Client Success Stories',
          'Long-term Partnership Strategies',
          'Customer Retention Masterclass'
        ];
        break;
      case 'sales_leader':
        recommendations.events = [
          'Sales Leadership Forum',
          'Team Management Workshop',
          'Sales Coaching Certification',
          'Revenue Strategy Planning'
        ];
        break;
      case 'technical_seller':
        recommendations.events = [
          'Technical Demo Best Practices',
          'Solution Architecture Workshop',
          'Developer Relations Networking',
          'API Integration Strategies'
        ];
        break;
    }

    // Connection recommendations based on interests and industry
    data.interests?.forEach(interest => {
      if (interest.includes('AI')) {
        recommendations.connections.push('AI/ML Sales Professionals');
      }
      if (interest.includes('Cybersecurity')) {
        recommendations.connections.push('Cybersecurity Sales Experts');
      }
      if (interest.includes('Cloud')) {
        recommendations.connections.push('Cloud Solutions Specialists');
      }
    });

    return recommendations;
  }
};