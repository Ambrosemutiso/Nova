'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function SellerChatDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Dummy conversation
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'buyer',
      text: 'Hi, is the product still available?',
      time: '10:00 AM',
    },
    {
      id: 2,
      sender: 'seller',
      text: 'Yes! It’s still in stock 😊',
      time: '10:02 AM',
    },
    {
      id: 3,
      sender: 'buyer',
      text: 'Great! Can I get it by tomorrow?',
      time: '10:04 AM',
    },
    {
      id: 4,
      sender: 'seller',
      text: 'Absolutely. We deliver within 24 hours in Nairobi 🚚',
      time: '10:05 AM',
    },
  ]);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: 'seller',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <button
          onClick={() => router.back()}
          className="md:hidden text-gray-700 dark:text-gray-300 hover:text-orange-500 transition"
        >
          <FiArrowLeft size={22} />
        </button>

        <Image
          src="/avatar.png"
          alt="Buyer Avatar"
          width={42}
          height={42}
          className="rounded-full object-cover border border-gray-200 dark:border-gray-700"
        />

        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
            Customer Chat #{id}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active now</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                msg.sender === 'seller'
                  ? 'bg-orange-500 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="block text-[10px] mt-1 text-right opacity-80">
                {msg.time}
              </span>
            </div>
          </motion.div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          onClick={handleSend}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-2.5 rounded-full shadow-md transition-transform active:scale-95"
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
}
