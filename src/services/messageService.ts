import { supabase } from '../config/supabase';
import type { Message, Chat } from '../types/messages';

export const messageService = {
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
    try {
      const chatId = [senderId, receiverId].sort().join('_');
      
      // Create or update chat
      const { error: chatError } = await supabase
        .from('chats')
        .upsert({
          id: chatId,
          participants: [senderId, receiverId],
          updated_at: new Date().toISOString(),
        });

      if (chatError) throw chatError;

      // Add message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          chat_id: chatId,
          read: false,
        });

      if (messageError) throw messageError;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToChat(chatId: string, callback: (messages: Message[]) => void): () => void {
    const subscription = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          // Fetch updated messages
          this.getChatMessages(chatId).then(callback);
        }
      )
      .subscribe();

    // Initial fetch
    this.getChatMessages(chatId).then(callback);

    return () => {
      subscription.unsubscribe();
    };
  },

  async getChatMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async markAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    const subscription = supabase
      .channel(`user-chats-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `participants.cs.{${userId}}`,
        },
        () => {
          // Fetch updated chats
          this.getUserChats(userId).then(callback);
        }
      )
      .subscribe();

    // Initial fetch
    this.getUserChats(userId).then(callback);

    return () => {
      subscription.unsubscribe();
    };
  },

  async getUserChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};