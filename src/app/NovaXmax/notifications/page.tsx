'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

type Role = 'seller' | 'buyer' | '';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [role, setRole] = useState<Role>('');
  const [county, setCounty] = useState('');
  const [userIds, setUserIds] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!title || !body) {
      return toast.error('Title and message are required');
    }

    setLoading(true);

    try {
      const payload: any = {
        title,
        body,
      };

      // 🎯 Optional targeting
      if (role) payload.role = role;
      if (county) payload.county = county;
      if (userIds.trim()) {
        payload.userIds = userIds.split(',').map(id => id.trim());
      }

      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Sent: ${data.sent} | Failed: ${data.failed}`);
        setTitle('');
        setBody('');
        setRole('');
        setCounty('');
        setUserIds('');
      } else {
        toast.error(data.error || 'Failed to send');
      }

    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pt-24">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">
        Send Notification
      </h1>

      <div className="space-y-4">

        {/* Title */}
        <input
          type="text"
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        {/* Message */}
        <textarea
          placeholder="Notification Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border px-4 py-2 rounded h-28"
        />

        {/* Role */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full border px-4 py-2 rounded"
        >
          <option value="">All Users</option>
          <option value="buyer">Buyers Only</option>
          <option value="seller">Sellers Only</option>
        </select>

        {/* County */}
        <input
          type="text"
          placeholder="Target County (Optional)"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        {/* Specific Users */}
        <input
          type="text"
          placeholder="Specific User IDs (comma separated)"
          value={userIds}
          onChange={(e) => setUserIds(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3 rounded font-semibold"
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>

      </div>
    </div>
  );
}