import { supabase } from '../config/supabase';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  chatId: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// Create or get existing chat between two users
export const createOrGetChat = async (userId1: string, userId2: string): Promise<string> => {
  try {
    // Create a consistent chat ID by sorting user IDs
    const chatId = [userId1, userId2].sort().join('_');
    
    // Check if chat already exists
    const { data: existingChat, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw fetchError;
    }

    if (existingChat) {
      return chatId;
    }

    // Create new chat
    const { error: insertError } = await supabase
      .from('chats')
      .insert({
        id: chatId,
        participants: [userId1, userId2],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      throw insertError;
    }

    return chatId;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
): Promise<void> => {
  try {
    const chatId = await createOrGetChat(senderId, receiverId);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        chat_id: chatId,
        timestamp: new Date().toISOString(),
        read: false
      });

    if (error) {
      throw error;
    }

    // Update chat's last message info
    await supabase
      .from('chats')
      .update({
        last_message: content,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId);

  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a chat
export const getMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        timestamp,
        read,
        chat_id
      `)
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      timestamp: msg.timestamp,
      read: msg.read,
      chatId: msg.chat_id
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Get user's chats
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        participants,
        last_message,
        last_message_time,
        updated_at
      `)
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get unread count for each chat
    const chatsWithUnread = await Promise.all(
      data.map(async (chat) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('receiver_id', userId)
          .eq('read', false);

        return {
          id: chat.id,
          participants: chat.participants,
          lastMessage: chat.last_message,
          lastMessageTime: chat.last_message_time,
          unreadCount: count || 0
        };
      })
    );

    return chatsWithUnread;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Subscribe to new messages for a chat
export const subscribeToMessages = (
  chatId: string,
  callback: (message: Message) => void
) => {
  return supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      (payload) => {
        const newMessage = payload.new as any;
        callback({
          id: newMessage.id,
          senderId: newMessage.sender_id,
          receiverId: newMessage.receiver_id,
          content: newMessage.content,
          timestamp: newMessage.timestamp,
          read: newMessage.read,
          chatId: newMessage.chat_id
        });
      }
    )
    .subscribe();
};