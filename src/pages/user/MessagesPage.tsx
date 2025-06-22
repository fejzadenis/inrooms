import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { MessageSquare, Send, User, Search, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/messageService';
import { networkService } from '../../services/networkService';
import type { Message, Chat } from '../../types/messages';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '../../components/common/Button';
import { toast } from 'react-hot-toast';

interface ChatWithUserInfo extends Chat {
  otherUserName?: string;
  otherUserPhoto?: string;
}

export function MessagesPage() {
  const { user } = useAuth();
  const [chats, setChats] = React.useState<ChatWithUserInfo[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<ChatWithUserInfo | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [sendingMessage, setSendingMessage] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = messageService.subscribeToUserChats(user.id, async (updatedChats) => {
      try {
        // Enhance chats with user information
        const chatsWithUserInfo = await Promise.all(
          updatedChats.map(async (chat) => {
            const otherUserId = chat.participants.find(id => id !== user.id);
            if (otherUserId) {
              try {
                // Get user info from network service
                const connections = await networkService.getNetworkUsers(user.id);
                const otherUser = connections.find(u => u.id === otherUserId);
                
                return {
                  ...chat,
                  otherUserName: otherUser?.name || 'Unknown User',
                  otherUserPhoto: otherUser?.photo_url || ''
                };
              } catch (error) {
                console.error('Error getting user info:', error);
                return {
                  ...chat,
                  otherUserName: 'Unknown User',
                  otherUserPhoto: ''
                };
              }
            }
            return chat;
          })
        );
        
        setChats(chatsWithUserInfo);
        setLoading(false);
      } catch (error) {
        console.error('Error processing chats:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    if (!selectedChat) return;

    const unsubscribe = messageService.subscribeToChat(selectedChat.id, (updatedMessages) => {
      setMessages(updatedMessages);
      scrollToBottom();
      
      // Mark messages as read
      updatedMessages.forEach(message => {
        if (message.receiverId === user?.id && !message.read) {
          messageService.markAsRead(message.id);
        }
      });
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChat || !newMessage.trim() || sendingMessage) return;

    const receiverId = selectedChat.participants.find(id => id !== user.id);
    if (!receiverId) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    setSendingMessage(true);

    try {
      await messageService.sendMessage(user.id, receiverId, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.otherUserName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading messages...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 h-[calc(100vh-12rem)]">
          {/* Sidebar */}
          <div className="col-span-4 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">
                    {searchTerm ? 'No conversations found' : 'No messages yet'}
                  </p>
                  <p className="text-xs mt-1">
                    {searchTerm ? 'Try a different search term' : 'Start a conversation from the Network page'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full p-4 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 transition-colors duration-200 ${
                        selectedChat?.id === chat.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {chat.otherUserPhoto ? (
                          <img
                            src={chat.otherUserPhoto}
                            alt={chat.otherUserName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-indigo-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat.otherUserName}
                        </p>
                        {chat.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage.senderId === user?.id ? 'You: ' : ''}
                            {chat.lastMessage.content}
                          </p>
                        )}
                        {chat.lastMessage && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatMessageTime(chat.lastMessage.timestamp)}
                          </p>
                        )}
                      </div>
                      {chat.lastMessage && chat.lastMessage.receiverId === user?.id && !chat.lastMessage.read && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedChat.otherUserPhoto ? (
                        <img
                          src={selectedChat.otherUserPhoto}
                          alt={selectedChat.otherUserName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedChat.otherUserName}
                        </h3>
                        <p className="text-sm text-gray-500">Connected</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                            message.senderId === user?.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id
                              ? 'text-indigo-200'
                              : 'text-gray-500'
                          }`}>
                            {format(message.timestamp, 'h:mm a')}
                            {message.senderId === user?.id && (
                              <span className="ml-1">
                                {message.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                      disabled={sendingMessage}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      isLoading={sendingMessage}
                      className="px-4 py-2"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}