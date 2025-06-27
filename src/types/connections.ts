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
  type: 'connection_request' | 'connection_accepted' | 'message' | 'event_reminder';
  title: string;
  message: string;
  relatedId?: string; // ID of related item (connection request, message, etc.)
  read: boolean;
  createdAt: Date;
}