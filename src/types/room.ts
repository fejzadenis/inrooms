export interface Room {
  id?: string;
  name: string;
  description: string;
  hostId: string;
  hostName?: string;
  capacity: number;
  currentParticipants: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  roomType: 'networking' | 'showcase' | 'workshop' | 'pitch' | 'coworking';
  isPrivate: boolean;
  accessCode?: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  meetingLink?: string;
  recordingUrl?: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoomParticipant {
  id?: string;
  roomId: string;
  userId: string;
  userName?: string;
  userPhoto?: string;
  role: 'host' | 'moderator' | 'participant' | 'observer';
  joinedAt: Date;
  leftAt?: Date;
}

export interface RoomFilter {
  roomType?: string;
  status?: string;
  hostId?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}