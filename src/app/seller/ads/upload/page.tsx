'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import {
  Eye, Plus, X, ChevronRight, ChevronLeft, Upload, Camera,
  Video, Image as ImageIcon, TrendingUp, Users, Zap, Star,
  CheckCircle, Sparkles, BarChart2, ShoppingBag, Play, Pause,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
interface Ad {
  _id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  views: number;
  category: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  calculatedPrice: number;
  images: string[];
}

/* ══════════════════════════════════════════════════════════════
   SMALL HELPERS
══════════════════════════════════════════════════════════════ */
function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[90px]">
      <div className="text-yellow-300">{icon}</div>
      <p className="text-white font-black text-lg leading-none">{value}</p>
      <p className="text-white/70 text-[10px] text-center leading-tight">{label}</p>
    </div>
  );
}

function BenefitRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONFETTI (CSS-only, no deps)
══════════════════════════════════════════════════════════════ */
const CONFETTI_COLORS = ['#f97316','#facc15','#34d399','#60a5fa','#f472b6','#a78bfa'];
function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm opacity-90"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FIRST AD CELEBRATION MODAL
══════════════════════════════════════════════════════════════ */
function CelebrationModal({ onClose, onCreateAnother }: {
  onClose: () => void;
  onCreateAnother: () => void;
}) {
  return (
    <>
      <Confetti />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-center">
          {/* top gradient */}
          <div className="bg-gradient-to-br from-orange-400 to-pink-500 px-6 pt-8 pb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-white font-black text-2xl">You're Live! 🎉</h2>
            <p className="text-orange-100 text-sm mt-1">Your first ad is now reaching buyers</p>
          </div>

          <div className="px-6 py-5 space-y-3">
            {[
              { icon: <Eye className="w-4 h-4 text-orange-500" />, text: 'Buyers can now see your product ad' },
              { icon: <TrendingUp className="w-4 h-4 text-orange-500" />, text: 'Sellers with ads get 3× more views' },
              { icon: <ShoppingBag className="w-4 h-4 text-orange-500" />, text: 'More ads = more sales momentum' },
            ].map((b, i) => <BenefitRow key={i} {...b} />)}
          </div>

          <div className="px-6 pb-6 flex flex-col gap-3">
            <button
              onClick={onCreateAnother}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold
                py-3.5 rounded-2xl transition active:scale-[0.98] shadow-md shadow-orange-200
                flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Another Ad
            </button>
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   UPLOAD MODAL (multi-step)
══════════════════════════════════════════════════════════════ */
interface UploadModalProps {
  products: Product[];
  sellerId: string;
  userCountry: string;
  onClose: () => void;
  onSuccess: (ad: Ad, isFirst: boolean) => void;
  totalAds: number;
}

type MediaTab = 'file' | 'camera';

function UploadModal({ products, sellerId, userCountry, onClose, onSuccess, totalAds }: UploadModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // form state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaTab, setMediaTab] = useState<MediaTab>('file');

  // camera recording
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');

  // upload
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  /* ── camera ── */
  const startCamera = useCallback(async (facing: 'user' | 'environment' = cameraFacing) => {
    try {
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });
      setCameraStream(stream);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  }, [cameraFacing, cameraStream]);

  useEffect(() => {
    if (mediaTab === 'camera') startCamera();
    else if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaTab]);

  // cleanup on unmount
  useEffect(() => () => { cameraStream?.getTracks().forEach(t => t.stop()); }, [cameraStream]);

  const flipCamera = async () => {
    const next = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(next);
    await startCamera(next);
  };

  const startRecording = () => {
    if (!cameraStream) return;
    const recorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
    setRecordedChunks([]);
    recorder.ondataavailable = (e) => { if (e.data.size > 0) setRecordedChunks(p => [...p, e.data]); };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const file = new File([blob], `ad-recording-${Date.now()}.webm`, { type: 'video/webm' });
      setMediaFile(file);
      setMediaType('video');
      setPreviewUrl(URL.createObjectURL(blob));
      // stop camera after recording
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    };
    mediaRecorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  /* ── file picker ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* ── submit ── */
  const handleUpload = async () => {
    if (!mediaFile || !title || !category || !selectedProduct) {
      setError('Please complete all required fields.');
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      const { data: signData } = await axios.post('/api/ads/upload');
      const { signature, timestamp, cloudName, apiKey, folder } = signData;

      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData,
        { onUploadProgress: (p) => { if (p.total) setProgress(Math.round((p.loaded * 100) / p.total)); } }
      );

      const saveRes = await axios.post('/api/ads/save', {
        sellerId, productId: selectedProduct._id,
        title, description, category,
        mediaUrl: uploadRes.data.secure_url,
        mediaType, country: userCountry || 'Unknown',
      });

      if (saveRes.status === 201) {
        onSuccess(saveRes.data.ad, totalAds === 0);
      } else throw new Error();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const canProceedStep1 = !!selectedProduct;
  const canProceedStep2 = !!title && !!category;
  const canProceedStep3 = !!mediaFile;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-black text-gray-900">Create Ad</h2>
              <p className="text-[10px] text-gray-400">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* step progress */}
        <div className="flex gap-1 px-5 pt-3 shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300
              ${step >= s ? 'bg-orange-500' : 'bg-gray-100'}`} />
          ))}
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* ── STEP 1: Pick product ── */}
          {step === 1 && (
            <>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-0.5">Which product are you promoting?</h3>
                <p className="text-xs text-gray-500">Choose the product that will be featured in this ad.</p>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No products found.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      className={`relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all duration-200 text-left
                        ${selectedProduct?._id === p._id
                          ? 'border-orange-500 shadow-lg shadow-orange-100 scale-[1.02]'
                          : 'border-gray-100 hover:border-orange-200'
                        }`}
                    >
                      {/* product image */}
                      <div className="aspect-square bg-gray-50 relative">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        {selectedProduct?._id === p._id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="px-2.5 py-2.5">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{p.name}</p>
                        <p className="text-xs font-black text-orange-600 mt-1">Ksh {p.calculatedPrice.toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── STEP 2: Ad details ── */}
          {step === 2 && (
            <>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-0.5">Tell buyers about this ad</h3>
                <p className="text-xs text-gray-500">A clear title and category helps more buyers find your ad.</p>
              </div>

              {/* selected product preview */}
              {selectedProduct && (
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-3">
                  {selectedProduct.images?.[0] && (
                    <img src={selectedProduct.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1">{selectedProduct.name}</p>
                    <p className="text-xs text-orange-600 font-bold">Ksh {selectedProduct.calculatedPrice.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Ad Title <span className="text-red-400">*</span></label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Premium Samsung Galaxy S24 — Best Price!"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Category <span className="text-red-400">*</span></label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Electronics, Fashion, Home…"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add extra details to convince buyers…"
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── STEP 3: Upload media ── */}
          {step === 3 && (
            <>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-0.5">Add your ad media</h3>
                <p className="text-xs text-gray-500">Upload a video or image, or record directly with your camera.</p>
              </div>

              {/* tab switcher */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                {(['file', 'camera'] as MediaTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMediaTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200
                      ${mediaTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab === 'file' ? <Upload className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                    {tab === 'file' ? 'Upload File' : 'Use Camera'}
                  </button>
                ))}
              </div>

              {/* file upload tab */}
              {mediaTab === 'file' && !previewUrl && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200
                  rounded-2xl py-10 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Upload className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Click to upload video or image</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, MOV, JPG, PNG up to 200MB</p>
                  <input type="file" accept="video/*,image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              {/* camera tab */}
              {mediaTab === 'camera' && !previewUrl && (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-64">
                    <video ref={cameraVideoRef} muted playsInline className="w-full h-full object-cover" />
                    {!cameraStream && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={() => startCamera()}
                          className="bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl">
                          Start Camera
                        </button>
                      </div>
                    )}
                    {/* flip camera btn */}
                    {cameraStream && (
                      <button onClick={flipCamera}
                        className="absolute top-3 right-3 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    )}
                    {/* recording indicator */}
                    {isRecording && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-[10px] font-bold">REC</span>
                      </div>
                    )}
                  </div>

                  {cameraStream && (
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition
                        ${isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                    >
                      {isRecording
                        ? <><Pause className="w-4 h-4" /> Stop Recording</>
                        : <><Play className="w-4 h-4" /> Start Recording</>
                      }
                    </button>
                  )}
                </div>
              )}

              {/* preview */}
              {previewUrl && (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden bg-black relative aspect-video">
                    {mediaType === 'video'
                      ? <video src={previewUrl} controls className="w-full h-full object-contain" />
                      : <img src={previewUrl} className="w-full h-full object-contain" alt="preview" />
                    }
                    <button
                      onClick={() => { setPreviewUrl(''); setMediaFile(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    {mediaType === 'video' ? '🎬' : '🖼️'} {mediaFile?.name}
                  </p>
                </div>
              )}

              {/* upload progress */}
              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Uploading…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            </>
          )}
        </div>

        {/* footer CTA */}
        <div className="px-5 pb-6 pt-3 border-t border-gray-100 shrink-0">
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600
                disabled:opacity-40 disabled:cursor-not-allowed
                text-white font-bold py-3.5 rounded-2xl transition active:scale-[0.98] shadow-md shadow-orange-200"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleUpload}
              disabled={isUploading || !canProceedStep3}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600
                disabled:opacity-40 disabled:cursor-not-allowed
                text-white font-bold py-3.5 rounded-2xl transition active:scale-[0.98] shadow-md shadow-orange-200"
            >
              {isUploading ? `Uploading… ${progress}%` : <><Upload className="w-4 h-4" /> Publish Ad</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EMPTY / PERSUASION STATE
══════════════════════════════════════════════════════════════ */
function PersuasionBanner({ onCreateAd }: { onCreateAd: () => void }) {
  return (
    <div className="space-y-5">
      {/* hero banner */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #2d1a00 50%, #7c2d12 100%)' }}>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />
        <div className="relative px-6 py-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Boost Your Sales</span>
          </div>
          <h2 className="text-white font-black text-2xl leading-tight mb-2">
            Sellers with Ads<br />earn <span className="text-orange-400">3× more</span>
          </h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Your products are hidden until buyers search. Ads put you in front of buyers who are ready to purchase — right now.
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar mb-6">
            <StatPill icon={<Users className="w-4 h-4" />} value="10K+" label="buyers see ads daily" />
            <StatPill icon={<TrendingUp className="w-4 h-4" />} value="3×" label="more product views" />
            <StatPill icon={<Star className="w-4 h-4" />} value="Top" label="placement in feed" />
          </div>
          <button
            onClick={onCreateAd}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600
              text-white font-black py-4 rounded-2xl transition active:scale-[0.98]
              shadow-lg shadow-orange-500/30 text-base"
          >
            <Plus className="w-5 h-5" /> Create My First Ad — It's Free
          </button>
        </div>
      </div>

      {/* benefit cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: <Eye className="w-5 h-5 text-blue-500" />,
            bg: 'bg-blue-50',
            title: 'Maximum Visibility',
            body: 'Your ad appears at the top of the feed, category pages, and search results.',
          },
          {
            icon: <BarChart2 className="w-5 h-5 text-green-500" />,
            bg: 'bg-green-50',
            title: 'Track Performance',
            body: 'See exactly how many buyers viewed and clicked your ad in real time.',
          },
          {
            icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
            bg: 'bg-orange-50',
            title: 'Sell Faster',
            body: 'Products with ads sell up to 5× faster than those without promotion.',
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              {card.icon}
            </div>
            <p className="text-sm font-bold text-gray-900">{card.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function SellerAdsPage() {
  const { user, isSeller } = useAuth();
  const sellerId = isSeller ? user?._id : null;

  const [ads, setAds] = useState<Ad[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  /* ── fetch ── */
  useEffect(() => {
    if (!sellerId) return;
    Promise.all([
      axios.get(`/api/ads/list?sellerId=${sellerId}`),
      axios.get(`/api/ads/products?sellerId=${sellerId}`),
    ]).then(([adsRes, productsRes]) => {
      setAds(adsRes.data.sellerAds || []);
      setProducts(productsRes.data.products || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [sellerId]);

  /* ── autoplay ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        e.isIntersecting ? v.play().catch(() => {}) : v.pause();
      }),
      { threshold: 0.6 }
    );
    Object.values(videoRefs.current).forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, [ads]);

  const handleFullscreenPlay = async (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;
    Object.values(videoRefs.current).forEach((v) => { if (v && v !== video) v.pause(); });
    try {
      if (video.requestFullscreen) await video.requestFullscreen();
      else if ((video as any).webkitEnterFullscreen) (video as any).webkitEnterFullscreen();
      video.muted = false; video.controls = true;
      await video.play();
      const exit = () => { video.controls = false; video.muted = true; };
      video.addEventListener('fullscreenchange', exit, { once: true });
      video.addEventListener('webkitendfullscreen', exit, { once: true });
    } catch {}
  };

  const handleSuccess = (ad: Ad, isFirst: boolean) => {
    setAds((prev) => [ad, ...prev]);
    setShowUpload(false);
    if (isFirst) setShowCelebration(true);
  };

  /* ── access guard ── */
  if (!isSeller) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <X className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-base font-bold text-gray-800">Sellers Only</p>
        <p className="text-sm text-gray-500 mt-1">You need a seller account to access this page.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-12">

        {/* ── page header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Ads</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {ads.length > 0 ? `${ads.length} ad${ads.length !== 1 ? 's' : ''} running` : 'Grow your sales with ads'}
            </p>
          </div>
          {ads.length > 0 && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white
                font-bold text-sm px-4 py-2.5 rounded-xl transition active:scale-95 shadow-md shadow-orange-200"
            >
              <Plus className="w-4 h-4" /> New Ad
            </button>
          )}
        </div>

        {/* ── loading skeleton ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="aspect-[9/16] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          /* ── persuasion state ── */
          <PersuasionBanner onCreateAd={() => setShowUpload(true)} />
        ) : (
          /* ── ads grid ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* create new card */}
            <button
              onClick={() => setShowUpload(true)}
              className="aspect-[9/16] bg-gradient-to-br from-orange-400 to-pink-500
                flex flex-col justify-center items-center rounded-2xl cursor-pointer
                hover:opacity-90 hover:scale-[1.02] transition-all duration-200 shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-bold text-sm">New Ad</p>
              <p className="text-white/70 text-[10px] mt-0.5">Boost a product</p>
            </button>

            {/* existing ads */}
            {ads.map((ad) => (
              <div
                key={ad._id}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black cursor-pointer
                  hover:scale-[1.02] transition-transform duration-200 shadow-sm group"
                onClick={() => ad.mediaType === 'video' && handleFullscreenPlay(ad._id)}
              >
                {ad.mediaType === 'video' ? (
                  <video
                    ref={(el) => { videoRefs.current[ad._id] = el; }}
                    src={ad.mediaUrl}
                    muted playsInline loop preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
                )}

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* title */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white text-[11px] font-semibold line-clamp-1">{ad.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Eye className="w-3 h-3 text-white/70" />
                    <span className="text-white/70 text-[10px]">{ad.views || 0} views</span>
                  </div>
                </div>

                {/* play icon for video */}
                {ad.mediaType === 'video' && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-black/40 rounded-full
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Play className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── modals ── */}
      {showUpload && sellerId && (
        <UploadModal
          products={products}
          sellerId={sellerId}
          userCountry={user?.country || 'Unknown'}
          onClose={() => setShowUpload(false)}
          onSuccess={handleSuccess}
          totalAds={ads.length}
        />
      )}

      {showCelebration && (
        <CelebrationModal
          onClose={() => setShowCelebration(false)}
          onCreateAnother={() => { setShowCelebration(false); setShowUpload(true); }}
        />
      )}
    </div>
  );
}