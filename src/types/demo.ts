export interface Demo {
  id?: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  hostCompany: string;
  hostTitle: string;
  scheduledDate: Date;
  duration: number; // in minutes
  maxAttendees: number;
  currentAttendees: number;
  tags: string[];
  category: 'product-demo' | 'solution-showcase' | 'case-study' | 'training';
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  isPublic: boolean;
  isFeatured: boolean;
  featuredUntil?: Date;
  meetingLink?: string;
  recordingUrl?: string;
  recordingDuration?: number;
  recordingUploadedAt?: Date;
  visibilityDuration?: number; // days the recording is visible
  visibilityExpiresAt?: Date;
  thumbnailUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DemoRegistration {
  id?: string;
  demoId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCompany?: string;
  registeredAt: Date;
  attended?: boolean;
  feedback?: string;
  rating?: number;
}

export interface DemoFilter {
  category?: string;
  status?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  hostId?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}