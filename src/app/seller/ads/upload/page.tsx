'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { Eye, Plus, Sparkles } from 'lucide-react';

export default function SellerAdsPage() {
  const { user, isSeller } = useAuth();
  const sellerId = isSeller ? user?._id : null;

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showUpload, setShowUpload] = useState(false);

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Media
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');
  const [previewUrl, setPreviewUrl] = useState('');

  // AI
  const [useAI, setUseAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Upload state
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Fetch ads
  useEffect(() => {
    if (!sellerId) return;

    const fetchAds = async () => {
      try {
        const res = await axios.get(`/api/ads/list?sellerId=${sellerId}`);
        setAds(res.data.sellerAds || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [sellerId]);

  // AI generation
  const generateAIAd = async () => {
    if (!aiPrompt) {
      setMessage('⚠️ Please describe your ad.');
      return;
    }

    setAiLoading(true);
    setMessage('');

    try {
      const res = await axios.post('/api/ads/ai-generate', {
        prompt: aiPrompt,
        type: mediaType,
        category,
      });

      setAiResult(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description);

      if (res.data.imageUrl) {
        setPreviewUrl(res.data.imageUrl);
      }
    } catch (err) {
      setMessage('❌ AI generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  // Upload / Save
  const handleUpload = async () => {
    if (!sellerId || !title || !category) {
      setMessage('⚠️ Missing required fields.');
      return;
    }

    setIsUploading(true);

    try {
      // AI Image Ad → no upload needed
      if (useAI && aiResult?.imageUrl) {
        const saveRes = await axios.post('/api/ads/save', {
          sellerId,
          title,
          description,
          category,
          mediaUrl: aiResult.imageUrl,
          mediaType: 'image',
          aiGenerated: true,
        });

        setAds((prev) => [saveRes.data.ad, ...prev]);
        setShowUpload(false);
        return;
      }

      // Manual upload
      if (!mediaFile) throw new Error('No file');

      const sign = await axios.post('/api/ads/upload');
      const { signature, timestamp, cloudName, apiKey, folder } = sign.data;

      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const upload = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData,
        {
          onUploadProgress: (p) =>
            p.total && setProgress(Math.round((p.loaded * 100) / p.total)),
        }
      );

      const mediaUrl = upload.data.secure_url;

      const saveRes = await axios.post('/api/ads/save', {
        sellerId,
        title,
        description,
        category,
        mediaUrl,
        mediaType,
      });

      setAds((prev) => [saveRes.data.ad, ...prev]);
      setShowUpload(false);
    } catch (err) {
      setMessage('❌ Upload failed.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  if (!isSeller) {
    return (
      <div className="text-center text-red-500 py-10">
        🚫 Only sellers can access this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 pt-24">
      <h1 className="text-xl font-bold mb-4">My Ads</h1>

      {loading ? (
        <p>Loading ads...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <div
            onClick={() => setShowUpload(true)}
            className="aspect-[9/16] bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col justify-center items-center rounded-lg cursor-pointer"
          >
            <Plus className="w-10 h-10 text-white" />
            <p className="text-white font-semibold mt-2">Create Ad</p>
          </div>

          {ads.map((ad) => (
            <div key={ad._id} className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
              {ad.mediaType === 'video' ? (
                <video src={ad.mediaUrl} muted loop className="w-full h-full object-cover" />
              ) : (
                <img src={ad.mediaUrl} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Create Ad
            </h2>

            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={useAI} onChange={() => setUseAI(!useAI)} />
              Use AI
            </label>

            {useAI && (
              <>
                <textarea
                  placeholder="Describe your business or offer"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full border p-2 rounded mb-2"
                >
                  <option value="image">Image Ad</option>
                  <option value="video">Video Ad</option>
                </select>

                <button
                  onClick={generateAIAd}
                  disabled={aiLoading}
                  className="w-full bg-purple-600 text-white py-2 rounded"
                >
                  {aiLoading ? 'Generating...' : 'Generate with AI'}
                </button>

                {aiResult?.videoScript && (
                  <div className="bg-gray-100 p-3 rounded mt-3 text-sm">
                    <strong>AI Video Script:</strong>
                    <p>{aiResult.videoScript}</p>
                  </div>
                )}
              </>
            )}

            <input
              className="w-full border p-2 rounded mt-3"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="w-full border p-2 rounded mt-2"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            {!useAI && (
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setMediaFile(f);
                    setPreviewUrl(URL.createObjectURL(f));
                    setMediaType(f.type.startsWith('video') ? 'video' : 'image');
                  }
                }}
                className="mt-3"
              />
            )}

            {previewUrl && (
              <img src={previewUrl} className="w-full mt-3 rounded" />
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-orange-500 text-white py-2 rounded mt-4"
            >
              {isUploading ? 'Posting...' : 'Post Ad'}
            </button>

            {message && <p className="text-sm text-center mt-2">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
