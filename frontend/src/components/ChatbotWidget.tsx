import React, { useState, useRef, useEffect } from 'react';
import { chatbotApi } from '@/services/api';

const BOT_NAME = 'FarmTrack Assistant';

export const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your FarmTrack Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const answer = await chatbotApi.sendMessage(userMsg.text);
      setMessages(prev => [...prev, { sender: 'bot', text: answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I could not process your request. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed z-50 bottom-6 right-6 flex flex-col items-end">
      {/* Toggle Button */}
      <button
        className={`rounded-full shadow-lg bg-primary text-white w-14 h-14 flex items-center justify-center transition-transform ${open ? 'mb-2 rotate-90' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        <span className="text-2xl">💬</span>
      </button>
      {/* Chatbot Panel */}
      {open && (
        <div className="w-80 max-w-xs sm:max-w-sm bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">{BOT_NAME}</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 text-lg">×</button>
          </div>
          {/* Messages */}
          <div className="flex-1 px-3 py-2 overflow-y-auto space-y-2 bg-gray-50" style={{ maxHeight: 320 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-900'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center border-t border-gray-200 bg-white px-2 py-2">
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
              disabled={loading}
            />
            <button
              type="submit"
              className="ml-2 px-3 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
              disabled={!input.trim() || loading}
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}; 