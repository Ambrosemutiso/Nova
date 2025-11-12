'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { Eye, Plus } from 'lucide-react';

export default function SellerAdsPage() {
  const { user, isSeller } = useAuth();
  const sellerId = isSeller ? user?._id : null;

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Upload states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  // 🔹 Fetch ads
  useEffect(() => {
    if (!sellerId) return;
    const fetchAds = async () => {
      try {
        const res = await axios.get(`/api/ads/list?sellerId=${sellerId}`);
        setAds(res.data.sellerAds || []);
      } catch (err) {
        console.error('❌ Failed to fetch ads', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [sellerId]);

  // 🔹 File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setMediaFile(file);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  // 🔹 Upload ad
// 🔹 Upload ad
const handleUpload = async () => {
  if (!mediaFile || !title || !category || !sellerId) {
    setMessage('⚠️ Please fill all required fields.');
    return;
  }
if (mediaFile.size > 50 * 1024 * 1024) { // 50 MB limit
  setMessage('⚠️ File too large. Max 50MB allowed.');
  return;
}

  setIsUploading(true);
  setMessage('');

  try {
    let fileBase64 = await fileToBase64(mediaFile);

    // 🧠 Ensure proper data URL format
    if (!fileBase64.startsWith('data:')) {
      const mimePrefix = mediaType === 'video'
        ? 'data:video/mp4;base64,'
        : 'data:image/jpeg;base64,';
      fileBase64 = mimePrefix + fileBase64;
    }

    const res = await axios.post(
      '/api/ads/upload',
      {
        sellerId,
        title,
        description,
        category,
        mediaType,
        country: user?.country || 'Unknown',
        fileBase64,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        onUploadProgress: (p) => {
          if (p.total) setProgress(Math.round((p.loaded * 100) / p.total));
        },
      }
    );

    if (res.status === 200 && res.data.ad) {
      setMessage('✅ Ad uploaded successfully!');
      setShowUpload(false);
      setAds((prev) => [res.data.ad, ...prev]); // instant refresh
      resetForm();
    } else {
      setMessage('❌ Upload failed.');
    }
  } catch (err) {
    console.error(err);
    setMessage('❌ Something went wrong.');
  } finally {
    setIsUploading(false);
  }
};


  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setMediaFile(null);
    setPreviewUrl('');
    setProgress(0);
  };

  if (!isSeller)
    return (
      <div className="text-center text-red-500 font-semibold py-10">
        🚫 Only sellers can access this page.
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-4 pt-24">
      <h1 className="text-xl font-bold mb-4 text-gray-800">My Ads</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading ads...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {/* Create Ad Tile */}
          <div
            onClick={() => setShowUpload(true)}
            className="aspect-[9/16] bg-gradient-to-br from-orange-400 to-pink-500 flex flex-col justify-center items-center rounded-lg cursor-pointer hover:opacity-90 transition"
          >
            <Plus className="w-10 h-10 text-white" />
            <p className="text-white mt-2 font-semibold">Create Ad</p>
          </div>

          {/* Ads List */}
          {ads.map((ad) => (
            <div
              key={ad._id}
              className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black"
            >
              {ad.mediaType === 'video' ? (
                <video
                  src={ad.mediaUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={ad.mediaUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-2 flex items-center text-white text-sm bg-black/50 px-2 py-0.5 rounded-full">
                <Eye className="w-4 h-4 mr-1" />
                {ad.views || 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-xl">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Upload New Ad
            </h2>

            <input
              type="text"
              placeholder="Ad Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              rows={2}
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            <input
              type="file"
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="mb-2"
            />

            {previewUrl && (
              <div className="mt-2 rounded-lg overflow-hidden">
                {mediaType === 'video' ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            )}

            {isUploading && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`w-full mt-4 py-2 rounded-lg text-white font-semibold ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isUploading ? `Uploading... ${progress}%` : 'Upload Ad'}
            </button>

            {message && (
              <p className="text-center text-sm mt-2 text-gray-600">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
