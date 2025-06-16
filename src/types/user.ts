export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  connections: string[];
  subscription: {
    status: 'trial' | 'active' | 'inactive';
    trialEndsAt?: Date;
    eventsQuota: number;
    eventsUsed: number;
  };
  profile: {
    title: string;
    company: string;
    location: string;
    about: string;
    skills: string[];
    achievements: Achievement[];
    portfolio: PortfolioItem[];
    testimonials: Testimonial[];
    dealShowcase: Deal[];
    points: number;
    badges: Badge[];
    joinedAt: Date;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    title: string;
    company: string;
  };
  createdAt: Date;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  closedAt: Date;
  isPublic: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'networking' | 'events' | 'engagement' | 'achievement';
  unlockedAt: Date;
}