'use client';

import { MessageSquare, Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">

        {/* Header */}
        <section className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-orange-600 mb-3"
          >
            Share Your Feedback
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg"
          >
            Help us improve NovaXmax. Tell us what you love, what we can improve, or any ideas you have.
          </motion.p>
        </section>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md rounded-2xl p-8 border border-gray-100"
          onSubmit={async (e) => {
            e.preventDefault();

            const form = e.currentTarget;
            const formData = new FormData(form);

            const payload = {
              name: formData.get("name"),
              email: formData.get("email"),
              type: formData.get("type"),
              rating: formData.get("rating"),
              message: formData.get("message"),
            };

            const message = payload.message as string;

            if (!message || message.length < 10) {
              alert("Feedback too short");
              return;
            }

            setLoading(true);

            try {
              const res = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              const data = await res.json();

              if (!res.ok) throw new Error(data.error);

              toast.success("✅ Feedback sent successfully!");
              form.reset();

            } catch (err) {
              toast.success("❌ Failed to send feedback.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            Your Feedback
          </h2>

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              name="name"
              required
              placeholder="Your Name"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Your Email"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Feedback Type */}
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Feedback Type
            </label>
            <select
              name="type"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option>General Feedback</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Complaint</option>
            </select>
          </div>

          {/* Rating */}
          <div className="mt-5">
            <label className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" />
              Rating
            </label>
            <select
              name="rating"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Very Bad</option>
            </select>
          </div>

          {/* Message */}
          <div className="mt-5">
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Write your feedback..."
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "Sending..." : "Submit Feedback"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}