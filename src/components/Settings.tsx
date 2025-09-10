'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Settings {
  country: string;
  currency: string;
  language: string;
  timezone: string;
}

interface ApiResponse {
  role: 'user' | 'seller';
  settings: Settings;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    country: '',
    currency: '',
    language: '',
    timezone: '',
  });
  const [role, setRole] = useState<'user' | 'seller' | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  // ✅ Token comes from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch existing settings
  useEffect(() => {
    if (!token) return;

    async function fetchSettings() {
      try {
        const res = await fetch(`/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data: ApiResponse = await res.json();

        setRole(data.role);
        setSettings(data.settings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [token]);

  // Save updated settings
  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      await res.json();
      alert('Settings updated successfully!');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading settings...</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
      <h2 className="text-xl font-semibold mb-4">
        {role === 'seller' ? 'Seller Settings' : 'User Settings'}
      </h2>

      {/* Country */}
      <label className="block mb-3">
        <span className="text-gray-700">Country</span>
        <select
          value={settings.country}
          onChange={(e) => setSettings({ ...settings, country: e.target.value })}
          className="w-full mt-1 p-2 border rounded-md"
        >
          <option value="">Select Country</option>
          <option value="KE">Kenya</option>
          <option value="UG">Uganda</option>
          <option value="TZ">Tanzania</option>
        </select>
      </label>

      {/* Currency */}
      <label className="block mb-3">
        <span className="text-gray-700">Currency</span>
        <select
          value={settings.currency}
          onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
          className="w-full mt-1 p-2 border rounded-md"
        >
          <option value="">Select Currency</option>
          <option value="KES">KES (Kenyan Shilling)</option>
          <option value="UGX">UGX (Ugandan Shilling)</option>
          <option value="TZS">TZS (Tanzanian Shilling)</option>
          <option value="USD">USD</option>
        </select>
      </label>

      {/* Language */}
      <label className="block mb-3">
        <span className="text-gray-700">Language</span>
        <select
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          className="w-full mt-1 p-2 border rounded-md"
        >
          <option value="">Select Language</option>
          <option value="en">English</option>
          <option value="sw">Swahili</option>
          <option value="fr">French</option>
        </select>
      </label>

      {/* Timezone */}
      <label className="block mb-4">
        <span className="text-gray-700">Timezone</span>
        <input
          type="text"
          value={settings.timezone}
          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
          placeholder="e.g., Africa/Nairobi"
          className="w-full mt-1 p-2 border rounded-md"
        />
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
