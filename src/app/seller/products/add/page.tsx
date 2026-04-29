'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import TextEditor from '@/components/TextEditor';
import { categoryTree } from "@/lib/productCategories";
type ProductCondition = 'brand_new' | 'used' | 'refurbished';
type Category = keyof typeof categoryTree;

type County = 'Nairobi' | 'Mombasa' | 'Kisumu'|'Kwale'|'Kilifi'|'TanaRiver'|'Lamu'
|'TaitaTaveta'|'Garissa'|'Wajir'|'Mandera'|'Marsabit'|'Isiolo'|'Meru'|'TharakaNithi'
|'Embu'|'Kitui'|'Machakos'|'Makueni'|'Nyandarua'|'Nyeri'|'Kirinyaga'|'Murang\'a'|'Kiambu'
|'Turkana'|'WestPokot'|'Samburu'|'TransNzoia'|'UasinGishu'|'ElgeyoMarakwet'|'Nandi'
|'Baringo'|'Laikipia'|'Narok'|'Kajiado'|'Kericho'|'Bomet'|'Kakamega'|'Vihiga'
|'Bungoma'|'Busia'|'Siaya'|'HomaBay'|'Migori'|'Kisii'|'Nyamira'|'Nakuru'

const countyTownMap: Record<County, string[]> = {
  Nairobi: [ 'Westlands', 'Kasarani', 'Embakasi', 'Langata', 'Dagoretti', 'Starehe', 'Makadara', 'Kibra'],
  Mombasa: ['Nyali', 'Likoni', 'Kisauni', 'Changamwe', 'Mvita', 'Jomvu'],
  Kisumu: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyando', 'Seme'],
  Nakuru: ['Nakuru Town East', 'Nakuru Town West', 'Naivasha', 'Gilgil', 'Subukia', 'Molo', 'Bahati'],
  Kiambu: ['Thika', 'Ruiru', 'Juja', 'Limuru', 'Kikuyu', 'Githunguri', 'Kabete'],
  Machakos: ['Machakos Town', 'Kangundo', 'Mwala', 'Kathiani', 'Mavoko', 'Yatta'],
  'Murang\'a': ['Murang\'a Town', 'Kandara', 'Kangema', 'Maragua', 'Kiharu', 'Mathioya'],
  Nyeri: ['Nyeri Town', 'Othaya', 'Tetu', 'Mathira', 'Mukurweini', 'Kieni'],
  Kirinyaga: ['Kerugoya', 'Kutus', 'Sagana', 'Baricho', 'Mwea'],
  Meru: ['Meru Town', 'Maua', 'Nkubu', 'Timau', 'Tigania', 'Igembe'],
  Embu: ['Embu Town', 'Runyenjes', 'Manyatta', 'Siakago'],
  TharakaNithi: ['Chuka', 'Chogoria', 'Marimanti', 'Kanyanga'],
  Kitui: ['Kitui Town', 'Mutomo', 'Mwingi', 'Kabati', 'Kwa Vonza'],
  Makueni: ['Wote', 'Mukuyuni', 'Makindu', 'Kibwezi', 'Mtito Andei', 'Emali'],
  Nyandarua: ['Ol Kalou', 'Engineer', 'Njabini', 'Ndemi', 'Kinangop'],
  Laikipia: ['Nanyuki', 'Rumuruti', 'Nyahururu', 'Kinamba', 'Doldol'],
  Turkana: ['Lodwar', 'Kakuma', 'Lokichogio', 'Lorugum'],
  WestPokot: ['Kapenguria', 'Makutano', 'Chepareria', 'Sigor'],
  Samburu: ['Maralal', 'Baragoi', 'Wamba'],
  TransNzoia: ['Kitale', 'Endebess', 'Kiminini', 'Cherangany'],
  UasinGishu: ['Eldoret', 'Turbo', 'Ziwa', 'Moiben', 'Kesses'],
  ElgeyoMarakwet: ['Iten', 'Tambach', 'Chebiemit', 'Kapsowar'],
  Nandi: ['Kapsabet', 'Nandi Hills', 'Mosoriot', 'Kobujoi'],
  Baringo: ['Kabarnet', 'Eldama Ravine', 'Marigat', 'Mogotio'],
  Kericho: ['Kericho Town', 'Litein', 'Londiani', 'Kipkelion'],
  Bomet: ['Bomet Town', 'Sotik', 'Longisa', 'Chepalungu'],
  Kakamega: ['Kakamega Town', 'Mumias', 'Lugari', 'Malava', 'Matungu'],
  Bungoma: ['Bungoma Town', 'Webuye', 'Kimilili', 'Chwele', 'Sirisia'],
  Busia: ['Busia Town', 'Nambale', 'Malaba', 'Butula', 'Funyula'],
  Siaya: ['Siaya Town', 'Bondo', 'Ugunja', 'Gem', 'Alego Usonga'],
  HomaBay: ['Homa Bay Town', 'Rongo', 'Mbita', 'Ndhiwa', 'Kabondo'],
  Migori: ['Migori Town', 'Awendo', 'Rongo', 'Kehancha', 'Isebania'],
  Kisii: ['Kisii Town', 'Ogembo', 'Nyamache', 'Keroka'],
  Nyamira: ['Nyamira Town', 'Keroka', 'Ekerenyo', 'Nyansiongo'],
  Narok: ['Narok Town', 'Kilgoris', 'Ololulung\'a', 'Suswa'],
  Kajiado: ['Kajiado Town', 'Ngong', 'Kitengela', 'Ongata Rongai', 'Loitokitok'],
  Kwale: ['Ukunda', 'Msambweni', 'Lunga Lunga', 'Kinango'],
  Kilifi: ['Kilifi Town', 'Malindi', 'Kaloleni', 'Rabai', 'Mariakani'],
  TaitaTaveta: ['Voi', 'Taveta', 'Wundanyi', 'Mwatate'],
  Garissa: ['Garissa Town', 'Modogashe', 'Balambala', 'Dadaab'],
  Wajir: ['Wajir Town', 'Griftu', 'Habaswein', 'Eldas', 'Buna'],
  Mandera: ['Mandera Town', 'Elwak', 'Rhamu', 'Lafey'],
  Marsabit: ['Marsabit Town', 'Moyale', 'Laisamis', 'North Horr'],
  Isiolo: ['Isiolo Town', 'Kinna', 'Garbatulla', 'Merti'],
  TanaRiver: ['Hola', 'Garsen', 'Bura', 'Wenje'],
  Lamu: ['Lamu Town', 'Mpeketoni', 'Hindi', 'Faza'],
  Vihiga: ['Mbale', 'Luanda', 'Chavakali', 'Hamisi'],
};

export default function AddProduct() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [boxContents, setBoxContents] = useState<string[]>([]);
  const [warranty, setWarranty] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [productType, setProductType] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [county, setCounty] = useState<County | ''>('');
  const [town, setTown] = useState('');
  const [fulfillmentMode, setFulfillmentMode] = useState('');
  const [condition, setCondition] = useState<ProductCondition | ''>('');
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [saving, setSaving] = useState(false);

  const DRAFT_KEY = 'novax_draft_product';

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...keyFeatures];
    updated[index] = value;
    setKeyFeatures(updated);
  };

  const addFeatureField = () => setKeyFeatures([...keyFeatures, '']);
  const removeFeatureField = (index: number) => setKeyFeatures(keyFeatures.filter((_, i) => i !== index));


  const handleBoxChange = (index: number, value: string) => {
    const updated = [...boxContents];
    updated[index] = value;
    setBoxContents(updated);
  };

  const addBoxField = () => setBoxContents([...boxContents, '']);
  const removeBoxField = (index: number) => setBoxContents(boxContents.filter((_, i) => i !== index));



  const handlePriceChange = (value: string) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      setPrice(value);
      setCalculatedPrice(parsed + parsed * 0.05);
    } else {
      setPrice('');
      setCalculatedPrice(0);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      return toast.warn('You can only upload upto 10 images');
    }

    const newFiles = files.slice(0, 10 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...newFiles]);
  };
const handleCountyChange = (selectedCounty: County | '') => {
  setCounty(selectedCounty);
  setTown('');
};

useEffect(() => {
  const draft = {
    name,
    brand,
    model,
    material,
    color,
    description,
    keyFeatures,
    boxContents,
    warranty,
    dimensions,
    weight,
    category,
    subcategory,
    productType,
    price,
    oldPrice,
    quantity,
    county,
    town,
    fulfillmentMode,
    condition,
  };

setSaving(true);
const timeout = setTimeout(() => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  setSaving(false);
}, 800);

  return () => clearTimeout(timeout);
}, [
  name, brand, model, material, color,
  description, keyFeatures, boxContents,
  warranty, dimensions, weight,
  category, subcategory, productType,
  price, oldPrice, quantity,
  county, town, fulfillmentMode, condition
]);

useEffect(() => {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved) {
    setShowDraftPrompt(true);
  }
}, []);

const loadDraft = () => {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) return;


  const draft = JSON.parse(saved);

  setName(draft.name || '');
  setBrand(draft.brand || '');
  setModel(draft.model || '');
  setMaterial(draft.material || '');
  setColor(draft.color || '');
  setDescription(draft.description || '');
  setKeyFeatures(draft.keyFeatures || []);
  setBoxContents(draft.boxContents || []);
  setWarranty(draft.warranty || '');
  setDimensions(draft.dimensions || '');
  setWeight(draft.weight || '');
  setCategory(draft.category || '');
  setSubcategory(draft.subcategory || '');
  setProductType(draft.productType || '');
  setPrice(draft.price || '');
  setOldPrice(draft.oldPrice || '');
  setQuantity(draft.quantity || '');
  setCounty(draft.county || '');
  setTown(draft.town || '');
  setFulfillmentMode(draft.fulfillmentMode || '');
  setCondition(draft.condition || '');

  setShowDraftPrompt(false);
};

useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };

  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return toast.error('You are not logged in!');
    if (!user?.currency) return toast. error('your currency is not updated!')
    if (!category) return toast.error('Please select a category!');
    if (!fulfillmentMode) return toast.error('Please select a fulfillment mode!');
    if (imageFiles.length === 0) return toast.error('Please upload at least one image!');
    if (!condition) return toast.error('Please select product condition!');
    if (!weight) return toast.error('Please Enter the product weight(kgs)!');

    setUploading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('material', material);
    formData.append('color', color);
// ✅ Only send description if not empty
if (description && description.trim().length > 0) {
  formData.append('description', description);
}

// ✅ Clean key features
const cleanedFeatures = keyFeatures.filter(f => f.trim() !== '');
if (cleanedFeatures.length > 0) {
  formData.append('keyFeatures', JSON.stringify(cleanedFeatures));
}

// ✅ Clean box contents
const cleanedBox = boxContents.filter(b => b.trim() !== '');
if (cleanedBox.length > 0) {
  formData.append('boxContents', JSON.stringify(cleanedBox));
}
    formData.append('warranty', warranty);
    formData.append('dimensions', dimensions);
    formData.append('weight', weight);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('productType', productType);
    formData.append('condition',condition);
    formData.append('price', price);
    formData.append('oldPrice', oldPrice);
    formData.append('calculatedPrice', String(calculatedPrice));
    formData.append('county', county);
    formData.append('town', town);
    formData.append('quantity', quantity);
    formData.append('sellerId', user._id);
    formData.append('fulfillmentMode', fulfillmentMode);
    formData.append('currency', user.currency);
    imageFiles.forEach((file) => formData.append('images', file));

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY); // 🔥 important
        toast.success('Product added successfully!');
        router.push('/seller/products/add');
      } else {
        toast.error(data.error || 'Failed to add product');
      }
    } catch {
      toast.error('Error uploading product');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 mx-auto px-4 pt-28 pb-10 min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Add Product</h1>
<form onSubmit={handleSubmit} className="space-y-4">

  {/* 🔥 TOP (FAST LISTING ZONE) */}

  {/* Images */}
  <div>
    <label className="block font-semibold">Product Images</label>
    <p className="text-sm text-gray-500 mb-2">
      Add clear images (1–10 is enough to go live fast)
    </p>
    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="w-full border px-4 py-2 rounded"/>
  </div>

  {/* Image Previews */}
  {imageFiles.length > 0 && (
    <div className="grid grid-cols-4 gap-2 mt-3">
      {imageFiles.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);
        return (
          <div key={index} className="relative w-20 h-20 border rounded overflow-hidden">
            <img src={previewUrl} className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== index))}
              className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  )}

  {/* Product Name */}
  <input type="text" className="w-full border px-4 py-2 rounded"
    placeholder="Product Name (e.g. Samsung Galaxy A14 128GB)"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
  />

  {/* Category */}
        <select
  value={category}
  onChange={(e) => {
    setCategory(e.target.value as Category);
    setSubcategory('');
    setProductType('');
  }}
  className="w-full border px-4 py-2 rounded"
>
  <option value="">Select Category</option>

  {Object.keys(categoryTree).map((cat) => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>
{category && (
  <select
    value={subcategory}
    onChange={(e) => {
      setSubcategory(e.target.value);
      setProductType('');
    }}
    className="w-full border px-4 py-2 rounded"
  >
    <option value="">Select Subcategory</option>

    {Object.keys(categoryTree[category as Category]).map((sub) => (
      <option key={sub} value={sub}>
        {sub}
      </option>
    ))}
  </select>
)}
{subcategory && category && (
  <select
    value={productType}
    onChange={(e) => setProductType(e.target.value)}
    className="w-full border px-4 py-2 rounded"
  >
    <option value="">Select Product Type</option>

    {(categoryTree[category as Category][subcategory as keyof typeof categoryTree[Category]] as string[]).map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}
  </select>
)}

    {/* OldPrice */}
    <input type="number" className="w-full border px-4 py-2 rounded"
    placeholder="Old Price (KES)"
    value={oldPrice}
    onChange={(e) => setOldPrice(e.target.value)}
    required
  />

  {/* Price */}
  <input type="number" className="w-full border px-4 py-2 rounded"
    placeholder="New Price (KES)"
    value={price}
    onChange={(e) => handlePriceChange(e.target.value)}
    required
  />

  {/* Quantity */}
  <input type="number" className="w-full border px-4 py-2 rounded"
    placeholder="Quantity Available"
    value={quantity}
    onChange={(e) => setQuantity(e.target.value)}
    required
  />
  {/* weight */}
  <input type="number" className="w-full border px-4 py-2 rounded"
   placeholder="Weight (Kgs)" 
   value={weight} onChange={(e) => setWeight(e.target.value)}
   required
  />


  {/* ⚡ MIDDLE */}

  {/* Condition */}
  <div>
    <label className="block font-semibold mb-1 text-gray-700">
      Product Condition
    </label>
    <select
      value={condition}
      onChange={(e) => setCondition(e.target.value as ProductCondition)}
      className="w-full border px-4 py-2 rounded"
      required
    >
      <option value="">Select Condition</option>
      <option value="brand_new">Brand New</option>
      <option value="used">Used</option>
      <option value="refurbished">Refurbished</option>
    </select>
  </div>

  {/* Fulfillment */}
  <div>
    <label className="block font-semibold mb-1 text-gray-700">
      Fulfillment Mode
    </label>
    <select
      value={fulfillmentMode}
      onChange={(e) => setFulfillmentMode(e.target.value)}
      className="w-full border px-4 py-2 rounded"
      required
    >
      <option value="">Select Fulfillment Option</option>
      <option value="company">Fulfilled by Novaxmax</option>
      <option value="seller">Fulfilled by Seller</option>
      <option value="thirdparty">Dropshipping / Third-Party</option>
    </select>
  </div>

  {/* Location */}
  <select value={county} onChange={(e) => handleCountyChange(e.target.value as County)}
    className="w-full border px-4 py-2 rounded" required>
    <option value="">Select County</option>
    {Object.keys(countyTownMap).map((countyName) => (
      <option key={countyName} value={countyName}>{countyName}</option>
    ))}
  </select>

  {county && (
    <select value={town} onChange={(e) => setTown(e.target.value)}
      className="w-full border px-4 py-2 rounded" required>
      <option value="">Select Town</option>
      {countyTownMap[county]?.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  )}


  {/* 💤 BOTTOM (OPTIONAL ZONE) */}

  <label className="block font-semibold">Product Description (Optional)</label>
  <p className="text-sm text-gray-500 mb-2">
    Skip for now if in a hurry — you can edit later
  </p>
  <TextEditor content={description} onChange={setDescription}/>

  {/* Features */}
  <div>
    <label className="block font-semibold">Key Features (Optional)</label>
    <p className="text-sm text-gray-500 mb-2">
      Add only if necessary (e.g. Battery, Size, Storage)
    </p>

    {keyFeatures.length === 0 ? (
      <button type="button" onClick={addFeatureField} className="text-orange-500">
        + Add Features
      </button>
    ) : (
      <>
        {keyFeatures.map((feature, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input className="flex-1 border px-4 py-2 rounded"
              value={feature}
              onChange={(e) => handleFeatureChange(idx, e.target.value)}
            />
            <button type="button" onClick={() => removeFeatureField(idx)} className="text-red-500">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addFeatureField} className="text-orange-500">
          + Add Another
        </button>
      </>
    )}
  </div>

  {/* Box Content */}
  <div>
    <label className="block font-semibold">What’s in the Box (Optional)</label>
    <p className="text-sm text-gray-500 mb-2">
      Skip if not important
    </p>

    {boxContents.length === 0 ? (
      <button type="button" onClick={addBoxField} className="text-orange-500">
        + Add Box Content
      </button>
    ) : (
      <>
        {boxContents.map((Box, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input className="flex-1 border px-4 py-2 rounded"
              value={Box}
              onChange={(e) => handleBoxChange(idx, e.target.value)}
            />
            <button type="button" onClick={() => removeBoxField(idx)} className="text-red-500">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addBoxField} className="text-orange-500">
          + Add Another
        </button>
      </>
    )}
  </div>

  {/* Specs */}
  <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Brand (Optional)" value={brand} onChange={(e) => setBrand(e.target.value)} />
  <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Model (Optional)" value={model} onChange={(e) => setModel(e.target.value)} />
  <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Material (Optional)" value={material} onChange={(e) => setMaterial(e.target.value)} />
  <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Color (Optional)" value={color} onChange={(e) => setColor(e.target.value)} />
  <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Warranty (Optional)" value={warranty} onChange={(e) => setWarranty(e.target.value)} />
  <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Dimensions (Optional)" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />

  {/* Submit */}
  <button disabled={uploading} type="submit" className="bg-orange-600 text-white px-4 py-2 rounded">
    {uploading ? 'Uploading...' : 'Add Product'}
  </button>

</form>

{showDraftPrompt && (
  <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mb-4">
    <p className="text-sm text-yellow-800 font-medium">
      You have an unsaved draft
    </p>

    <div className="flex gap-3 mt-3">
      <button
        onClick={loadDraft}
        className="bg-orange-600 text-white px-4 py-2 rounded"
      >
        Continue Draft
      </button>

      <button
        onClick={() => {
          localStorage.removeItem(DRAFT_KEY);
          setShowDraftPrompt(false);
        }}
        className="border px-4 py-2 rounded"
      >
        Start New
      </button>
    </div>
  </div>
)}
{saving && (
  <p className="text-xs text-gray-500">Saving draft...</p>
)}
    </div>
  );
}


