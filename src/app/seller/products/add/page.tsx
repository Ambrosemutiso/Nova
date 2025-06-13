'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import TextEditor from '@/components/TextEditor';

type County = 'Nairobi' | 'Mombasa' | 'Kisumu'|'Kwale'|'Kilifi'|'TanaRiver'|'Lamu'
|'TaitaTaveta'|'Garissa'|'Wajir'|'Mandera'|'Marsabit'|'Isiolo'|'Meru'|'TharakaNithi'
|'Embu'|'Kitui'|'Machakos'|'Makueni'|'Nyandarua'|'Nyeri'|'Kirinyaga'|'Muranga'|'Kiambu'
|'Turkana'|'WestPokot'|'Samburu'|'TransNzoia'|'UasinGishu'|'ElgeyoMarakwet'|'Nandi'
|'Baringo'|'Laikipia'|'Narok'|'Kajiado'|'Kericho'|'Bomet'|'Kakamega'|'Vihiga'
|'Bungoma'|'Busia'|'Siaya'|'HomaBay'|'Migori'|'Kisii'|'Nyamira'|'Nakuru'

const countyTownMap: Record<County, string[]> = {
  Nairobi: ['Nairobi CBD', 'Westlands', 'Kasarani'],
  Mombasa: ['Mombasa Island', 'Nyali', 'Likoni'],
  Kisumu: ['Kisumu Town', 'Maseno', 'Ahero'],
  Kwale: ['Ukunda', 'Msambweni', 'Lunga Lunga'],
  Kilifi: ['Kilifi Town', 'Malindi', 'Kaloleni'],
  TanaRiver: ['Hola', 'Garsen', 'Bura'],
  Lamu: ['Lamu Town', 'Mpeketoni', 'Hindi'],
  TaitaTaveta: ['Voi', 'Taveta', 'Wundanyi'],
  Garissa: ['Garissa Town', 'Dadaab', 'Hulugho'],
  Wajir: ['Wajir Town', 'Eldas', 'Tarbaj'],
  Mandera: ['Mandera Town', 'Elwak', 'Rhamu'],
  Marsabit: ['Marsabit Town', 'Moyale', 'Laisamis'],
  Isiolo: ['Isiolo Town', 'Merti', 'Garbatulla'],
  Meru: ['Meru Town', 'Maua', 'Timau'],
  TharakaNithi: ['Chuka', 'Marimanti', 'Kathwana'],
  Embu: ['Embu Town', 'Runyenjes', 'Siakago'],
  Kitui: ['Kitui Town', 'Mwingi', 'Mutomo'],
  Machakos: ['Machakos Town', 'Kangundo', 'Mwala'],
  Makueni: ['Wote', 'Makindu', 'Sultan Hamud'],
  Nyandarua: ['Ol Kalou', 'Engineer', 'Njabini'],
  Nyeri: ['Nyeri Town', 'Karatina', 'Othaya'],
  Kirinyaga: ['Kerugoya', 'Kianyaga', 'Kutus'],
  Muranga: ['Murang’a Town', 'Kangema', 'Kandara'],
  Kiambu: ['Thika', 'Kiambu Town', 'Ruiru'],
  Turkana: ['Lodwar', 'Lokichoggio', 'Kakuma'],
  WestPokot: ['Kapenguria', 'Chepareria', 'Sigor'],
  Samburu: ['Maralal', 'Baragoi', 'Archers Post'],
  TransNzoia: ['Kitale', 'Endebess', 'Kiminini'],
  UasinGishu: ['Eldoret', 'Turbo', 'Moi’s Bridge'],
  ElgeyoMarakwet: ['Iten', 'Kapsowar', 'Tambach'],
  Nandi: ['Kapsabet', 'Nandi Hills', 'Mosoriot'],
  Baringo: ['Kabarnet', 'Eldama Ravine', 'Marigat'],
  Laikipia: ['Nanyuki', 'Rumuruti', 'Nyahururu'],
  Nakuru: ['NakuruTown', 'Naivasha', 'Molo'],
  Narok: ['Narok Town', 'Kilgoris', 'Emurua Dikirr'],
  Kajiado: ['Kajiado Town', 'Ngong', 'Kitengela'],
  Kericho: ['Kericho Town', 'Litein', 'Londiani'],
  Bomet: ['Bomet Town', 'Sotik', 'Chepalungu'],
  Kakamega: ['Kakamega Town', 'Mumias', 'Lugari'],
  Vihiga: ['Mbale', 'Luanda', 'Hamisi'],
  Bungoma: ['Bungoma Town', 'Webuye', 'Kimilili'],
  Busia: ['Busia Town', 'Malaba', 'Nambale'],
  Siaya: ['Siaya Town', 'Bondo', 'Ugunja'],
  Kisii: ['Kisii Town', 'Nyamache', 'Ogembo'],
  Nyamira: ['Nyamira Town', 'Keroka', 'Manga'],
  HomaBay: ['HomaBay Town', 'Mbita', 'Kendu Bay'],
  Migori: ['Migori Town', 'Awendo', 'Rongo']
};


const productCategories = [
          'Electronics',
          'Fashion',
          'Phones',
          'Laptops',
          'Computers',
          'Household',
          'Kitchen',
          'Sofas',
          'Health',
          'Beauty',
          'Women',
          'Kids',
          'Skincare',
          'Men',
          'Books',
          'Machines',
          'Spares',
          'Motors',
          'Liquor',
];


export default function AddProduct() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [keyFeatures, setKeyFeatures] = useState(['']);
  const [boxContents, setBoxContents] = useState('');
  const [warranty, setWarranty] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [county, setCounty] = useState<County | ''>('');
  const [town, setTown] = useState('');

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...keyFeatures];
    updated[index] = value;
    setKeyFeatures(updated);
  };

  const addFeatureField = () => setKeyFeatures([...keyFeatures, '']);
  const removeFeatureField = (index: number) => setKeyFeatures(keyFeatures.filter((_, i) => i !== index));

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return toast.error('You are not logged in');
    if (!category) return toast.error('Please select a category.');
    if (imageFiles.length === 0) return toast.error('Please upload at least one image.');

    setUploading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('mainMaterial', material);
    formData.append('color', color);
    formData.append('description', description);
    formData.append('keyFeatures', JSON.stringify(keyFeatures));
    formData.append('whatsInTheBox', boxContents);
    formData.append('warranty', warranty);
    formData.append('dimensions', dimensions);
    formData.append('weight', weight);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('oldPrice', oldPrice);
    formData.append('calculatedPrice', String(calculatedPrice));
    formData.append('county', county);
    formData.append('town', town);
    formData.append('quantity', quantity);
    formData.append('sellerId', user.uid);
    imageFiles.forEach((file) => formData.append('images', file));

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
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
    <div className="max-w-2xl mx-auto p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
        <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Main Material" value={material} onChange={(e) => setMaterial(e.target.value)} />
        <input type="text" className="w-full border px-4 py-2 rounded" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />
        <TextEditor content={description} onChange={setDescription} />

        <div>
          <label className="block font-semibold">Key Features:</label>
          {keyFeatures.map((feature, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border px-4 py-2 rounded" value={feature} onChange={(e) => handleFeatureChange(idx, e.target.value)} />
              <button type="button" onClick={() => removeFeatureField(idx)} className="text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addFeatureField} className="text-blue-500">+ Add Feature</button>
        </div>

        <input type="string" className="w-full border px-4 py-2 rounded" placeholder="What's in the Box" value={boxContents} onChange={(e) => setBoxContents(e.target.value)} />
        <input type="string" className="w-full border px-4 py-2 rounded" placeholder="Warranty Period" value={warranty} onChange={(e) => setWarranty(e.target.value)} />
        <input type="string" className="w-full border px-4 py-2 rounded" placeholder="Dimensions (L x W x H)" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
        <input type="string" className="w-full border px-4 py-2 rounded" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} />

        <select className="w-full border px-4 py-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select Category</option>
          {productCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={county}
          onChange={(e) => handleCountyChange(e.target.value as County)}
          className="w-full border px-4 py-2 rounded"
          required
        >
          <option value="">Select County</option>
          {Object.keys(countyTownMap).map((countyName) => (
            <option key={countyName} value={countyName}>{countyName}</option>
          ))}
        </select>
        {county && countyTownMap[county] && (
          <select
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          >
            <option value="">Select Town</option>
            {countyTownMap[county]?.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
        <input type="number" className="w-full border px-4 py-2 rounded" placeholder="Price" value={price} onChange={(e) => handlePriceChange(e.target.value)} required />
        <input type="number" className="w-full border px-4 py-2 rounded" placeholder="Old Price" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} required/>
        <input type="number" className="w-full border px-4 py-2 rounded" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="w-full border px-4 py-2 rounded"/>
        <button disabled={uploading} type="submit" className="bg-orange-600 text-white px-4 py-2 rounded">
          {uploading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}


