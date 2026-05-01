'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

type TargetType = "all" | "role" | "users";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [role, setRole] = useState('');
  const [userIds, setUserIds] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!title || !body) {
      return toast.error('Title and message are required');
    }

    setLoading(true);

    try {
      let target: any = { type: targetType };

      if (targetType === "role") {
        target.value = role;
      }

      if (targetType === "users") {
        target.value = userIds.split(',').map(id => id.trim());
      }

      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, target }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Sent: ${data.sent} | Failed: ${data.failed}`);
      } else {
        toast.error(data.error);
      }

    } catch {
      toast.error('Error sending notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pt-24">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">
        Smart Notifications
      </h1>

      <div className="space-y-4">

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        <textarea
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border px-4 py-2 rounded h-28"
        />

        {/* TARGET TYPE */}
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value as TargetType)}
          className="w-full border px-4 py-2 rounded"
        >
          <option value="all">All Users</option>
          <option value="role">By Role</option>
          <option value="users">Specific Users</option>
        </select>

        {/* ROLE */}
        {targetType === "role" && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select Role</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
          </select>
        )}

        {/* USER IDS */}
        {targetType === "users" && (
          <input
            type="text"
            placeholder="Comma-separated user IDs"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
        )}

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3 rounded"
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>

      </div>
    </div>
  );
}