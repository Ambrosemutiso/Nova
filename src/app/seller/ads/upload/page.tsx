'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { Eye, Plus } from 'lucide-react';

export default function SellerAdsPage() {
  const { user, isSeller } = useAuth();
  const sellerId = isSeller ? user?._id : null;

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Fetch seller ads
  useEffect(() => {
    if (!sellerId) return;
    const fetchAds = async () => {
      try {
        const res = await axios.get(`/api/ads/list?sellerId=${sellerId}`);
        setAds(res.data.sellerAds || []);
      } catch (err) {
        console.error('❌ Fetch ads error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [sellerId]);

  // Autoplay videos when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    Object.values(videoRefs.current).forEach((v) => {
      if (v) observer.observe(v);
    });

    return () => observer.disconnect();
  }, [ads]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!sellerId || !mediaFile || !title || !category) {
      setMessage('⚠️ Please fill all required fields.');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      // 1️⃣ Get signed upload data
      const { data: signData } = await axios.post('/api/ads/upload');
      const { signature, timestamp, cloudName, apiKey, folder } = signData;

      // 2️⃣ Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData,
        {
          onUploadProgress: (p) => {
            if (p.total) setProgress(Math.round((p.loaded * 100) / p.total));
          },
        }
      );

      const mediaUrl = uploadRes.data.secure_url;

      // 3️⃣ Save ad record
      const saveRes = await axios.post('/api/ads/save', {
        sellerId,
        title,
        description,
        category,
        mediaUrl,
        mediaType,
        country: user?.country || 'Unknown',
      });

      if (saveRes.status === 201) {
        setMessage('✅ Ad uploaded successfully!');
        setShowUpload(false);
        setAds((prev) => [saveRes.data.ad, ...prev]);
      } else throw new Error('Failed to save ad');
    } catch (err) {
      console.error('❌ Upload error:', err);
      setMessage('❌ Upload failed.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleFullscreenPlay = async (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    Object.values(videoRefs.current).forEach((v) => {
      if (v && v !== video) v.pause();
    });

    try {
      if (video.requestFullscreen) await video.requestFullscreen();
      else if ((video as any).webkitEnterFullscreen) (video as any).webkitEnterFullscreen();

      video.muted = false;
      video.controls = true;
      await video.play();

      const exitHandler = () => {
        video.controls = false;
        video.muted = true;
      };
      video.addEventListener('fullscreenchange', exitHandler, { once: true });
      video.addEventListener('webkitendfullscreen', exitHandler, { once: true });
    } catch (err) {
      console.error('⚠️ Fullscreen error:', err);
    }
  };

  if (!isSeller)
    return (
      <div className="text-center text-red-500 font-semibold py-10">
        🚫 Only sellers can access this page.
      </div>
    );

  return (
    <div className="md:ml-64 max-w-2xl p-4 mx-auto px-4 pt-24 pb-10 min-h-screen bg-white">
      <h1 className="text-xl font-bold mb-4 text-gray-800">My Ads</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading ads...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {/* Upload Button */}
          <div
            onClick={() => setShowUpload(true)}
            className="aspect-[9/16] bg-gradient-to-br from-orange-400 to-pink-500 flex flex-col justify-center items-center rounded-lg cursor-pointer hover:opacity-90 transition"
          >
            <Plus className="w-10 h-10 text-white" />
            <p className="text-white mt-2 font-semibold">Create Ad</p>
          </div>

          {/* Ads */}
          {ads.map((ad) => (
            <div
              key={ad._id}
              className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black cursor-pointer"
              onClick={() => ad.mediaType === 'video' && handleFullscreenPlay(ad._id)}
            >
              {ad.mediaType === 'video' ? (
                <video
                  ref={(el) => {
                    videoRefs.current[ad._id] = el;
                  }}
                  src={ad.mediaUrl}
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
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

            <h2 className="text-lg font-semibold mb-3 text-gray-800">Upload New Ad</h2>

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
                  <video src={previewUrl} controls className="w-full rounded-lg" />
                ) : (
                  <img src={previewUrl} className="w-full rounded-lg" />
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
                isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isUploading ? `Uploading... ${progress}%` : 'Upload Ad'}
            </button>

            {message && (
              <p className="text-center text-sm mt-2 text-gray-600">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
