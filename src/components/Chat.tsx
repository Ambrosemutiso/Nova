'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io();

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

export default function Chat({
  userId,
  peerId
}: {
  userId: string;
  peerId: string;
}) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    socket.emit('join', { userId });

    // load history
    fetch(`/api/messages?user1=${userId}&user2=${peerId}`)
      .then(r => r.json())
      .then(data => setMsgs(data.messages || []));

    socket.on('receiveMessage', (msg: Message) =>
      setMsgs(prev => [...prev, msg])
    );

    return () => { socket.off('receiveMessage'); };
  }, [userId, peerId]);

  const send = () => {
    if (!text.trim()) return;
    socket.emit('sendMessage', {
      senderId: userId,
      receiverId: peerId,
      message: text
    });
    setText('');
  };

  return (
    <div className="border p-4 flex flex-col max-w-md mx-auto h-[500px]">
      <div className="flex-1 overflow-y-auto mb-2 space-y-2">
        {msgs.map(m => (
          <div
            key={m._id}
            className={`rounded px-2 py-1 ${
              m.senderId === userId ? 'self-end bg-orange-200' : 'self-start bg-gray-200'
            }`}
          >
            {m.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          placeholder="Type a message…"
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
        />
        <button onClick={send} className="bg-orange-500 text-white px-4 py-1 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
