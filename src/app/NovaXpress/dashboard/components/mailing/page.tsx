'use client';

import { useState } from 'react';

const templates = [
  { id: 1, name: 'Account Activation', value: 'activation' },
  { id: 2, name: 'Account Suspended', value: 'suspension' },
  { id: 3, name: 'Order Confirmation', value: 'order_confirmation' },
  { id: 4, name: 'Order Shipped', value: 'order_shipped' },
  { id: 5, name: 'General Announcement', value: 'announcement' },
];

export default function MailingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].value);
  const [recipientType, setRecipientType] = useState('buyer');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      setMessage('Please enter recipient email.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          recipientType,
          recipientEmail,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Email sent successfully!');
        setRecipientEmail('');
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to send email'}`);
      }
    } catch (error) {
      setMessage('❌ Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">📧 Send Email</h2>

      {/* Recipient Type */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Recipient Type</label>
        <select
          value={recipientType}
          onChange={(e) => setRecipientType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
      </div>

      {/* Recipient Email */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Recipient Email</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="Enter recipient email"
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Template Selection */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Template</label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full border p-2 rounded"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.value}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSendEmail}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Sending...' : 'Send Email'}
      </button>

      {/* Status Message */}
      {message && (
        <p className="mt-4 text-center font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
