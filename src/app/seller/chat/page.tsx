'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiMessageCircle, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';

export default function Chat() {
  const router = useRouter();

  // 💬 Start with no chats
  const [chats, setChats] = useState<any[]>([]);

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
    <div className="relative min-h-screen pt-28 pb-16 px-6 overflow-hidden bg-gradient-to-b from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* 🌈 Animated background blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3, y: [0, 25, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute -top-32 left-10 w-96 h-96 bg-gradient-to-r from-orange-300 to-yellow-200 rounded-full blur-3xl opacity-30"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3, y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 15 }}
        className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-gradient-to-l from-orange-200 to-orange-100 rounded-full blur-3xl opacity-30"
      />

      {/* 💬 Page Header */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-orange-600">
          Chats
        </h1>
        <p className="text-gray-700 mt-2">
          Your conversations with customers appear here.
        </p>
      </div>

      <div className="relative z-10 grid md:grid-cols-3 gap-6">
        {/* 🧩 Chat List */}
        <div className="md:col-span-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-md p-4 flex flex-col max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2 mb-4">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              className="bg-transparent flex-1 text-sm focus:outline-none text-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Empty state for no chats */}
          {chats.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10">
              <Player
                autoplay
                loop
                src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
                style={{ height: '200px', width: '200px' }}
              />
              <p className="mt-3 text-orange-700 font-medium text-sm text-center">
                No chats yet
              </p>
            </div>
          )}
        </div>

        {/* 🖼 Chat Placeholder / Content */}
        <div className="md:col-span-2 hidden md:flex items-center justify-center rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md">
          <div className="text-center px-6 py-10">
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
      </div>

      {/* ✨ Floating New Chat Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-transform active:scale-95"
      >
        <FiPlus size={24} />
      </button>

      {/* 📝 Modal */}
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
