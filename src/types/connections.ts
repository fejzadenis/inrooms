export interface ConnectionRequest {
  id?: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Notification {
  id?: string;
  userId: string;
  type: 'connection_request' | 'connection_accepted' | 'message' | 'event_reminder' | 'system';
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
}