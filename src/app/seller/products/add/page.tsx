'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import TextEditor from '@/components/TextEditor';
import { categoryTree } from '@/lib/productCategories';
import {
  Camera, X, Plus, ChevronDown, ChevronRight,
  Package, Tag, MapPin, Truck, FileText, CheckCircle2,
  AlertCircle, Info, Eye, Loader2, ImageOff, Star
} from 'lucide-react';

type ProductCondition = 'brand_new' | 'used' | 'refurbished';
type Category = keyof typeof categoryTree;
type County = keyof typeof countyTownMap;

const countyTownMap: Record<string, string[]> = {
  Nairobi: ['Westlands','Kasarani','Embakasi','Langata','Dagoretti','Starehe','Makadara','Kibra'],
  Mombasa: ['Nyali','Likoni','Kisauni','Changamwe','Mvita','Jomvu'],
  Kisumu: ['Kisumu Central','Kisumu East','Kisumu West','Muhoroni','Nyando','Seme'],
  Nakuru: ['Nakuru Town East','Nakuru Town West','Naivasha','Gilgil','Subukia','Molo','Bahati'],
  Kiambu: ['Thika','Ruiru','Juja','Limuru','Kikuyu','Githunguri','Kabete'],
  Machakos: ['Machakos Town','Kangundo','Mwala','Kathiani','Mavoko','Yatta'],
  "Murang'a": ["Murang'a Town",'Kandara','Kangema','Maragua','Kiharu','Mathioya'],
  Nyeri: ['Nyeri Town','Othaya','Tetu','Mathira','Mukurweini','Kieni'],
  Kirinyaga: ['Kerugoya','Kutus','Sagana','Baricho','Mwea'],
  Meru: ['Meru Town','Maua','Nkubu','Timau','Tigania','Igembe'],
  Embu: ['Embu Town','Runyenjes','Manyatta','Siakago'],
  TharakaNithi: ['Chuka','Chogoria','Marimanti','Kanyanga'],
  Kitui: ['Kitui Town','Mutomo','Mwingi','Kabati','Kwa Vonza'],
  Makueni: ['Wote','Mukuyuni','Makindu','Kibwezi','Mtito Andei','Emali'],
  Nyandarua: ['Ol Kalou','Engineer','Njabini','Ndemi','Kinangop'],
  Laikipia: ['Nanyuki','Rumuruti','Nyahururu','Kinamba','Doldol'],
  Turkana: ['Lodwar','Kakuma','Lokichogio','Lorugum'],
  WestPokot: ['Kapenguria','Makutano','Chepareria','Sigor'],
  Samburu: ['Maralal','Baragoi','Wamba'],
  TransNzoia: ['Kitale','Endebess','Kiminini','Cherangany'],
  UasinGishu: ['Eldoret','Turbo','Ziwa','Moiben','Kesses'],
  ElgeyoMarakwet: ['Iten','Tambach','Chebiemit','Kapsowar'],
  Nandi: ['Kapsabet','Nandi Hills','Mosoriot','Kobujoi'],
  Baringo: ['Kabarnet','Eldama Ravine','Marigat','Mogotio'],
  Kericho: ['Kericho Town','Litein','Londiani','Kipkelion'],
  Bomet: ['Bomet Town','Sotik','Longisa','Chepalungu'],
  Kakamega: ['Kakamega Town','Mumias','Lugari','Malava','Matungu'],
  Bungoma: ['Bungoma Town','Webuye','Kimilili','Chwele','Sirisia'],
  Busia: ['Busia Town','Nambale','Malaba','Butula','Funyula'],
  Siaya: ['Siaya Town','Bondo','Ugunja','Gem','Alego Usonga'],
  HomaBay: ['Homa Bay Town','Rongo','Mbita','Ndhiwa','Kabondo'],
  Migori: ['Migori Town','Awendo','Rongo','Kehancha','Isebania'],
  Kisii: ['Kisii Town','Ogembo','Nyamache','Keroka'],
  Nyamira: ['Nyamira Town','Keroka','Ekerenyo','Nyansiongo'],
  Narok: ["Narok Town",'Kilgoris',"Ololulung'a",'Suswa'],
  Kajiado: ['Kajiado Town','Ngong','Kitengela','Ongata Rongai','Loitokitok'],
  Kwale: ['Ukunda','Msambweni','Lunga Lunga','Kinango'],
  Kilifi: ['Kilifi Town','Malindi','Kaloleni','Rabai','Mariakani'],
  TaitaTaveta: ['Voi','Taveta','Wundanyi','Mwatate'],
  Garissa: ['Garissa Town','Modogashe','Balambala','Dadaab'],
  Wajir: ['Wajir Town','Griftu','Habaswein','Eldas','Buna'],
  Mandera: ['Mandera Town','Elwak','Rhamu','Lafey'],
  Marsabit: ['Marsabit Town','Moyale','Laisamis','North Horr'],
  Isiolo: ['Isiolo Town','Kinna','Garbatulla','Merti'],
  TanaRiver: ['Hola','Garsen','Bura','Wenje'],
  Lamu: ['Lamu Town','Mpeketoni','Hindi','Faza'],
  Vihiga: ['Mbale','Luanda','Chavakali','Hamisi'],
};

const DRAFT_KEY = 'novax_draft_product';

// ── Safely creates an object URL, returns null on failure ─────────────────────
function safeObjectURL(file: File): string | null {
  try {
    return URL.createObjectURL(file);
  } catch {
    return null;
  }
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  id, icon: Icon, title, badge, children,
}: {
  id: string; icon: React.ElementType; title: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div id={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">{title}</h2>
          {badge && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{badge}</p>}
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

// ── Labelled input wrapper ────────────────────────────────────────────────────
function Field({
  label, hint, required, error, children,
}: {
  label: string; hint?: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="text-orange-500">*</span>}
        {hint && (
          <span className="ml-1 text-[10px] font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{hint}</span>
        )}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls = `w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all`;

const selectCls = `${inputCls} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_14px_center]`;

export default function AddProduct() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName]             = useState('');
  const [brand, setBrand]           = useState('');
  const [model, setModel]           = useState('');
  const [material, setMaterial]     = useState('');
  const [color, setColor]           = useState('');
  const [description, setDescription] = useState('');
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [boxContents, setBoxContents] = useState<string[]>([]);
  const [warranty, setWarranty]     = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight]         = useState('');
  const [category, setCategory]     = useState<Category | ''>('');
  const [subcategory, setSubcategory] = useState('');
  const [productType, setProductType] = useState('');
  const [price, setPrice]           = useState('');
  const [oldPrice, setOldPrice]     = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [quantity, setQuantity]     = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews]     = useState<(string | null)[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [county, setCounty]         = useState('');
  const [town, setTown]             = useState('');
  const [fulfillmentMode, setFulfillmentMode] = useState('');
  const [condition, setCondition]   = useState<ProductCondition | ''>('');
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [priceError, setPriceError] = useState('');

  // ── Price validation ────────────────────────────────────────────────────────
  const priceNum    = parseFloat(price) || 0;
  const oldPriceNum = parseFloat(oldPrice) || 0;
  const discount    = oldPriceNum > 0 && priceNum > 0
    ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100)
    : 0;

  useEffect(() => {
    if (oldPriceNum > 0 && priceNum > 0 && oldPriceNum <= priceNum) {
      setPriceError('Original price must be higher than the selling price to show a discount.');
    } else {
      setPriceError('');
    }
  }, [price, oldPrice]);

  // ── Safe image previews ─────────────────────────────────────────────────────
  useEffect(() => {
    const urls = imageFiles.map(f => safeObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach(u => { if (u) URL.revokeObjectURL(u); });
    };
  }, [imageFiles]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Filter to valid image types only
    const validTypes = ['image/jpeg','image/png','image/webp','image/gif','image/avif'];
    const valid = files.filter(f => validTypes.includes(f.type));
    const invalid = files.length - valid.length;
    if (invalid > 0) toast.warn(`${invalid} file(s) skipped — only JPEG, PNG, WebP, GIF, and AVIF are accepted.`);
    if (valid.length + imageFiles.length > 10) {
      toast.warn('Maximum 10 images allowed.');
      const remaining = 10 - imageFiles.length;
      setImageFiles(prev => [...prev, ...valid.slice(0, remaining)]);
    } else {
      setImageFiles(prev => [...prev, ...valid]);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ── Draft ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) setShowDraftPrompt(true);
  }, []);

  const draftValues = {
    name, brand, model, material, color, description, keyFeatures, boxContents,
    warranty, dimensions, weight, category, subcategory, productType,
    price, oldPrice, quantity, county, town, fulfillmentMode, condition,
  };

  useEffect(() => {
    setSaving(true);
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftValues));
      setSaving(false);
    }, 800);
    return () => clearTimeout(t);
  }, Object.values(draftValues));

  const loadDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    const d = JSON.parse(saved);
    setName(d.name || ''); setBrand(d.brand || ''); setModel(d.model || '');
    setMaterial(d.material || ''); setColor(d.color || ''); setDescription(d.description || '');
    setKeyFeatures(d.keyFeatures || []); setBoxContents(d.boxContents || []);
    setWarranty(d.warranty || ''); setDimensions(d.dimensions || ''); setWeight(d.weight || '');
    setCategory(d.category || ''); setSubcategory(d.subcategory || ''); setProductType(d.productType || '');
    setPrice(d.price || ''); setOldPrice(d.oldPrice || ''); setQuantity(d.quantity || '');
    setCounty(d.county || ''); setTown(d.town || '');
    setFulfillmentMode(d.fulfillmentMode || ''); setCondition(d.condition || '');
    setShowDraftPrompt(false);
  };

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const handlePriceChange = (value: string) => {
    setPrice(value);
    const parsed = parseFloat(value);
    setCalculatedPrice(isNaN(parsed) ? 0 : parsed + parsed * 0.05);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id)       return toast.error('You are not logged in.');
    if (!user?.currency)  return toast.error('Your account currency is not set.');
    if (!category)        return toast.error('Select a category.');
    if (!fulfillmentMode) return toast.error('Select a fulfillment mode.');
    if (imageFiles.length === 0) return toast.error('Upload at least one product image.');
    if (!condition)       return toast.error('Select the product condition.');
    if (!weight)          return toast.error('Enter the product weight (kg).');
    if (priceError)       return toast.error(priceError);

    // Validate all previews are loadable before submitting
    const brokenIndexes = previews.reduce<number[]>((acc, p, i) => {
      if (!p) acc.push(i);
      return acc;
    }, []);
    if (brokenIndexes.length > 0) {
      return toast.error(`Image${brokenIndexes.length > 1 ? 's' : ''} ${brokenIndexes.map(i => i+1).join(', ')} could not be read. Please re-upload them.`);
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('material', material);
    formData.append('color', color);
    if (description?.trim()) formData.append('description', description);
    const cleanFeatures = keyFeatures.filter(f => f.trim());
    if (cleanFeatures.length) formData.append('keyFeatures', JSON.stringify(cleanFeatures));
    const cleanBox = boxContents.filter(b => b.trim());
    if (cleanBox.length) formData.append('boxContents', JSON.stringify(cleanBox));
    formData.append('warranty', warranty);
    formData.append('dimensions', dimensions);
    formData.append('weight', weight);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('productType', productType);
    formData.append('condition', condition);
    formData.append('price', price);
    formData.append('oldPrice', oldPrice);
    formData.append('calculatedPrice', String(calculatedPrice));
    formData.append('county', county);
    formData.append('town', town);
    formData.append('quantity', quantity);
    formData.append('sellerId', user._id);
    formData.append('fulfillmentMode', fulfillmentMode);
    formData.append('currency', user.currency);
    imageFiles.forEach(f => formData.append('images', f));

    try {
      const res  = await fetch('/api/products', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY);
        toast.success('Product listed successfully!');
        router.push('/seller/products/add');
      } else {
        toast.error(data.error || 'Failed to list product.');
      }
    } catch {
      toast.error('Upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const primaryImage = previews.find(p => p !== null) ?? null;

  return (
    <div className="min-h-screen bg-[#f8f7f4] pt-24 pb-16">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-1">Seller Hub</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              List a Product<span className="text-orange-500">.</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">Fill in the required fields to go live. Optional fields help buyers find your product faster.</p>
          </div>
          {saving && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
              <Loader2 size={11} className="animate-spin" /> Saving draft…
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Form column ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Images */}
          <Section id="images" icon={Camera} title="Product Images" badge="Required · Up to 10 photos">
            {/* Upload zone */}
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/40 hover:bg-orange-50 cursor-pointer transition-colors group">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={handleImageUpload} className="sr-only" />
              <Camera size={22} className="text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-orange-500">Click to add photos</p>
              <p className="text-[11px] text-gray-400 mt-0.5">JPEG · PNG · WebP · GIF · AVIF</p>
            </label>

            {/* Grid preview */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {imageFiles.map((file, i) => {
                  const url = previews[i];
                  const isBroken = url === null;
                  return (
                    <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isBroken ? 'border-red-300 bg-red-50' : i === 0 ? 'border-orange-400' : 'border-gray-200 bg-gray-50'}`}>
                      {isBroken ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <ImageOff size={16} className="text-red-400" />
                          <span className="text-[9px] text-red-400 font-semibold text-center px-1">Re-upload</span>
                        </div>
                      ) : (
                        <img
                          src={url!}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => {
                            // Mark as broken by revoking and setting null
                            if (url) URL.revokeObjectURL(url);
                            setPreviews(prev => {
                              const next = [...prev];
                              next[i] = null;
                              return next;
                            });
                          }}
                        />
                      )}
                      {i === 0 && !isBroken && (
                        <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">Cover</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-gray-900/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}
                {/* Add more slot */}
                {imageFiles.length < 10 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-colors">
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={handleImageUpload} className="sr-only" />
                    <Plus size={18} className="text-gray-300" />
                  </label>
                )}
              </div>
            )}
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <Info size={10} /> First image is the cover photo shown to buyers.
              {previews.some(p => p === null) && <span className="text-red-500 font-semibold ml-1">⚠ Remove broken images before submitting.</span>}
            </p>
          </Section>

          {/* Basic Info */}
          <Section id="basics" icon={Package} title="Product Details" badge="Required">
            <Field label="Product Name" required>
              <input
                type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Samsung Galaxy A14 128GB Dual SIM"
                className={inputCls}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Category" required>
                <select value={category} onChange={e => { setCategory(e.target.value as Category); setSubcategory(''); setProductType(''); }} className={selectCls} required>
                  <option value="">Select…</option>
                  {Object.keys(categoryTree).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Subcategory">
                <select value={subcategory} onChange={e => { setSubcategory(e.target.value); setProductType(''); }} className={selectCls} disabled={!category}>
                  <option value="">Select…</option>
                  {category && Object.keys(categoryTree[category as Category]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Type">
                  <select
    value={productType}
    onChange={(e) => setProductType(e.target.value)}
    className={selectCls} disabled={!subcategory}
  >
    <option value="">Select Product Type</option>

    {(categoryTree[category as Category][subcategory as keyof typeof categoryTree[Category]] as string[]).map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}
  </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Condition" required>
                <select value={condition} onChange={e => setCondition(e.target.value as ProductCondition)} className={selectCls} required>
                  <option value="">Select…</option>
                  <option value="brand_new">Brand New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </Field>
              <Field label="Quantity in Stock" required>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 50" className={inputCls} required />
              </Field>
            </div>
          </Section>

          {/* Pricing */}
          <Section id="pricing" icon={Tag} title="Pricing" badge="Required">
            {/* Info callout */}
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Original price</strong> is crossed out for buyers — it must be <strong>higher</strong> than the selling price to display a discount badge. If you have no discount, leave Original Price blank.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Original Price (KES)" hint="Before discount" error={priceError}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Ksh</span>
                  <input
                    type="number" min="0" value={oldPrice}
                    onChange={e => setOldPrice(e.target.value)}
                    placeholder="e.g. 5999"
                    className={`${inputCls} pl-12`}
                  />
                </div>
              </Field>

              <Field label="Selling Price (KES)" required>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Ksh</span>
                  <input
                    type="number" min="0" value={price}
                    onChange={e => handlePriceChange(e.target.value)}
                    placeholder="e.g. 3999"
                    className={`${inputCls} pl-12`}
                    required
                  />
                </div>
              </Field>
            </div>

            {/* Live pricing preview */}
            {priceNum > 0 && (
              <div className="flex flex-wrap items-center gap-4 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Buyer Sees</p>
                  <div className="flex items-center gap-2">
                    {oldPriceNum > priceNum && (
                      <span className="line-through text-gray-400 text-xs">Ksh {oldPriceNum.toLocaleString()}</span>
                    )}
                    <span className="font-black text-gray-900">Ksh {priceNum.toLocaleString()}</span>
                    {discount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{discount}%</span>
                    )}
                  </div>
                </div>
                <div className="border-l border-gray-200 pl-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Platform Fee (5%)</p>
                  <p className="font-semibold text-gray-700">Ksh {(priceNum * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="border-l border-gray-200 pl-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Buyer Pays</p>
                  <p className="font-black text-orange-600">Ksh {calculatedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            )}
          </Section>

          {/* Shipping & Location */}
          <Section id="shipping" icon={Truck} title="Shipping & Location" badge="Required">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Fulfillment" required>
                <select value={fulfillmentMode} onChange={e => setFulfillmentMode(e.target.value)} className={selectCls} required>
                  <option value="">Select…</option>
                  <option value="company">Fulfilled by NovaXmax</option>
                  <option value="seller">Fulfilled by Seller</option>
                  <option value="thirdparty">Dropshipping / Third-Party</option>
                </select>
              </Field>
              <Field label="Weight (kg)" required>
                <input type="number" min="0" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 0.5" className={inputCls} required />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="County" required>
                <select value={county} onChange={e => { setCounty(e.target.value); setTown(''); }} className={selectCls} required>
                  <option value="">Select county…</option>
                  {Object.keys(countyTownMap).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Town" required>
                <select value={town} onChange={e => setTown(e.target.value)} className={selectCls} disabled={!county} required>
                  <option value="">Select town…</option>
                  {county && countyTownMap[county]?.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* Description */}
          <Section id="description" icon={FileText} title="Description & Features" badge="Optional — helps buyers find & trust your product">
            <Field label="Product Description" hint="Optional">
              <TextEditor content={description} onChange={setDescription} />
            </Field>

            <Field label="Key Features" hint="Optional — e.g. battery life, storage, size">
              <div className="space-y-2">
                {keyFeatures.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={f}
                      onChange={e => { const u = [...keyFeatures]; u[i] = e.target.value; setKeyFeatures(u); }}
                      placeholder={`Feature ${i + 1}`}
                      className={`${inputCls} flex-1`}
                    />
                    <button type="button" onClick={() => setKeyFeatures(keyFeatures.filter((_, j) => j !== i))} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setKeyFeatures([...keyFeatures, ''])} className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition">
                  <Plus size={13} /> Add feature
                </button>
              </div>
            </Field>

            <Field label="What's in the Box" hint="Optional">
              <div className="space-y-2">
                {boxContents.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={b}
                      onChange={e => { const u = [...boxContents]; u[i] = e.target.value; setBoxContents(u); }}
                      placeholder={`Item ${i + 1}`}
                      className={`${inputCls} flex-1`}
                    />
                    <button type="button" onClick={() => setBoxContents(boxContents.filter((_, j) => j !== i))} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setBoxContents([...boxContents, ''])} className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition">
                  <Plus size={13} /> Add item
                </button>
              </div>
            </Field>
          </Section>

          {/* Specs */}
          <Section id="specs" icon={FileText} title="Specifications" badge="Optional">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Brand', brand, setBrand, 'e.g. Samsung'],
                ['Model', model, setModel, 'e.g. SM-A145F'],
                ['Material', material, setMaterial, 'e.g. Polycarbonate'],
                ['Color', color, setColor, 'e.g. Black'],
                ['Warranty', warranty, setWarranty, 'e.g. 1 Year'],
                ['Dimensions', dimensions, setDimensions, 'e.g. 16.5 × 7.6 × 0.9 cm'],
              ].map(([label, val, setter, ph]) => (
                <Field key={label as string} label={label as string} hint="Optional">
                  <input type="text" value={val as string} onChange={e => (setter as any)(e.target.value)} placeholder={ph as string} className={inputCls} />
                </Field>
              ))}
            </div>
          </Section>

          {/* Submit */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Ready to publish?</p>
                <p className="text-xs text-gray-400 mt-0.5">Your product will go live immediately after submission.</p>
              </div>
              <button
                type="submit"
                disabled={uploading || !!priceError || previews.some(p => p === null && imageFiles.length > 0)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <><Loader2 size={15} className="animate-spin" /> Uploading…</>
                ) : (
                  <><CheckCircle2 size={15} /> Publish Product</>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ── Sticky sidebar preview ────────────────────────────────────── */}
        <div className="hidden lg:block sticky top-28 space-y-4">

          {/* Live product card preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Eye size={13} className="text-gray-400" />
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Buyer Preview</p>
            </div>
            <div className="p-4">
              {/* Image preview */}
              <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden mb-3">
                {primaryImage ? (
                  <img src={primaryImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                    <Camera size={28} />
                    <p className="text-xs">No image yet</p>
                  </div>
                )}
              </div>
              {/* Card info */}
              <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-1">
                {name || <span className="text-gray-300">Product name…</span>}
              </p>
              {condition && (
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-2">
                  {condition === 'brand_new' ? 'Brand New' : condition === 'used' ? 'Used' : 'Refurbished'}
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                {oldPriceNum > priceNum && priceNum > 0 && (
                  <span className="text-xs text-gray-400 line-through">Ksh {oldPriceNum.toLocaleString()}</span>
                )}
                <span className="text-base font-black text-orange-600">
                  {priceNum > 0 ? `Ksh ${priceNum.toLocaleString()}` : <span className="text-gray-300 text-sm font-medium">Price…</span>}
                </span>
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-{discount}%</span>
                )}
              </div>
              {county && town && (
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> {town}, {county}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-gray-200 fill-gray-200" />)}
                <span className="text-[10px] text-gray-300 ml-1">No reviews yet</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Listing Checklist</p>
            <div className="space-y-2">
              {[
                { label: 'Photo uploaded',    done: imageFiles.length > 0 && !previews.some(p => p === null) },
                { label: 'Product name',      done: name.length > 3 },
                { label: 'Category selected', done: !!category },
                { label: 'Selling price set', done: priceNum > 0 && !priceError },
                { label: 'Quantity set',      done: parseInt(quantity) > 0 },
                { label: 'Condition set',     done: !!condition },
                { label: 'Location set',      done: !!county && !!town },
                { label: 'Fulfillment set',   done: !!fulfillmentMode },
                { label: 'Weight entered',    done: parseFloat(weight) > 0 },
              ].map(({ label, done }) => (
                <div key={label} className={`flex items-center gap-2 text-xs transition-colors ${done ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-gray-100 border border-gray-200'}`}>
                    {done && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Draft modal ───────────────────────────────────────────────────── */}
      {showDraftPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(5,7,12,0.6)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-sm p-6">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
              <FileText size={18} className="text-orange-500" />
            </div>
            <h2 className="text-base font-black text-gray-900 mb-1">Unsaved draft found</h2>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              You started a product listing earlier. Would you like to continue where you left off?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { localStorage.removeItem(DRAFT_KEY); setShowDraftPrompt(false); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Start fresh
              </button>
              <button
                onClick={loadDraft}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition shadow-md shadow-orange-200"
              >
                Continue draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}