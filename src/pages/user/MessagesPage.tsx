import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { MessageSquare, Send, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/messageService';
import type { Message, Chat } from '../../types/messages';
import { format } from 'date-fns';

export function MessagesPage() {
  const { user } = useAuth();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = messageService.subscribeToUserChats(user.id, (updatedChats) => {
      setChats(updatedChats);
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    if (!selectedChat) return;

    const unsubscribe = messageService.subscribeToChat(selectedChat.id, (updatedMessages) => {
      setMessages(updatedMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChat || !newMessage.trim()) return;

    const receiverId = selectedChat.participants.find(id => id !== user.id);
    if (!receiverId) return;

    try {
      await messageService.sendMessage(user.id, receiverId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-12 min-h-[600px]">
          {/* Sidebar */}
          <div className="col-span-4 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-4 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 ${
                    selectedChat?.id === chat.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {chat.participants.find(id => id !== user?.id)}
                    </p>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">
                    {selectedChat.participants.find(id => id !== user?.id)}
                  </h3>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          message.senderId === user?.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.id
                            ? 'text-indigo-200'
                            : 'text-gray-500'
                        }`}>
                          {format(message.timestamp, 'p')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a conversation to start messaging
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