'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiMessageCircle, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const router = useRouter();

  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'John Mwangi',
      avatar: '/avatar.png',
      lastMessage: 'Hey! I wanted to ask about my recent order.',
      time: '2m ago',
      unread: true,
    },
    {
      id: '2',
      name: 'Grace Otieno',
      avatar: '/avatar.png',
      lastMessage: 'Thanks for the quick delivery 🙏',
      time: '10m ago',
      unread: false,
    },
    {
      id: '3',
      name: 'Ali Yusuf',
      avatar: '/avatar.png',
      lastMessage: 'Can you restock that phone case?',
      time: '1h ago',
      unread: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newChat, setNewChat] = useState({ name: '', message: '' });

  const handleAddChat = () => {
    if (!newChat.name.trim() || !newChat.message.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      name: newChat.name.trim(),
      avatar: '/avatar.png',
      lastMessage: newChat.message.trim(),
      time: 'Just now',
      unread: false,
    };

    setChats((prev) => [newEntry, ...prev]);
    setShowModal(false);
    setNewChat({ name: '', message: '' });
  };

  return (
    <div className="relative flex h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FiMessageCircle className="text-orange-500" />
            Messages
          </h2>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              className="bg-transparent flex-1 text-sm focus:outline-none text-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
          {chats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => router.push(`/seller/chat/${chat.id}`)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all ${
                chat.unread ? 'bg-orange-50 dark:bg-gray-800' : ''
              }`}
            >
              <Image
                src={chat.avatar}
                alt={chat.name}
                width={44}
                height={44}
                className="rounded-full object-cover"
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {chat.name}
                  </h4>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {chat.time}
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 truncate ${
                    chat.unread
                      ? 'text-gray-800 dark:text-gray-200 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {chat.lastMessage}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Placeholder */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-white via-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-orange-500 rounded-full shadow-lg"
          >
            <FiMessageCircle className="text-white text-3xl" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Select or start a chat
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Conversations with your customers will appear here.
          </p>
        </div>
      </div>

      {/* Floating New Chat Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-transform active:scale-95"
      >
        <FiPlus size={24} />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[90%] max-w-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Start a New Chat
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-orange-500"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newChat.name}
                    onChange={(e) =>
                      setNewChat((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    First Message
                  </label>
                  <textarea
                    value={newChat.message}
                    onChange={(e) =>
                      setNewChat((prev) => ({ ...prev, message: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    placeholder="Type your opening message..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-md text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddChat}
                    className="px-4 py-2 rounded-md text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-md transition"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
