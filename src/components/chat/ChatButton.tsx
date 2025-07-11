import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { LiveSupportChat } from './LiveSupportChat';

export function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        aria-label="Open support chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
      
      <LiveSupportChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}