'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';

export default function AdUploadPage() {
  const { user, isSeller } = useAuth();
  const sellerId = isSeller ? user?._id : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  // 🔹 Handle file input + preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setMediaFile(file);

    // Detect media type
    const type = file.type.startsWith('video') ? 'video' : 'image';
    setMediaType(type);

    // Create preview URL
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 🔹 Convert file → base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // 🔹 Upload handler with progress tracking
  const handleUpload = async () => {
    if (!sellerId) {
      setMessage('⚠️ Only sellers can upload ads.');
      return;
    }

    if (!mediaFile || !title || !category) {
      setMessage('⚠️ Please fill all required fields and select a file.');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setMessage('');

    try {
      const fileBase64 = await fileToBase64(mediaFile);

      const res = await axios.post(
        '/api/ads/upload',
        {
          sellerId,
          title,
          description,
          category,
          mediaType,
          fileBase64,
        },
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (res.status === 200 && res.data.ad) {
        setMessage('✅ Ad uploaded successfully!');
        setTitle('');
        setDescription('');
        setCategory('');
        setPreviewUrl('');
        setMediaFile(null);
        setProgress(0);
      } else {
        setMessage('❌ Upload failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Something went wrong during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 relative min-h-screen pt-28 pb-16 bg-white shadow-lg rounded-2xl border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Upload a New Ad
      </h1>

      {!isSeller ? (
        <p className="text-center text-red-500 font-semibold">
          🚫 You must be logged in as a seller to upload ads.
        </p>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ad Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
          />
          <input
            type="text"
            placeholder="Category (e.g. Electronics, Fashion)"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Select Ad File</label>
            <input
              type="file"
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-700"
            />
          </div>

          {previewUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
              {mediaType === 'video' ? (
                <video src={previewUrl} controls className="w-full rounded-lg" />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
              )}
            </div>
          )}

          {isUploading && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-orange-500 h-3 transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`w-full p-3 font-semibold rounded-lg text-white transition 
              ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}
            `}
          >
            {isUploading ? `Uploading... ${progress}%` : 'Upload Ad'}
          </button>

          {message && (
            <p className="text-center text-sm mt-3 font-medium text-gray-700">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
