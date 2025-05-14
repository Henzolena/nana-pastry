import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Cake, CakeCategory, CakeSize } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import { getCakeImages, uploadCakeImages, deleteCakeImagesByUrls } from '@/services/storage'; // Import storage functions
import { X } from 'lucide-react'; // Import X icon

const CakeForm: React.FC = () => {
  const { cakeId } = useParams<{ cakeId?: string }>();
  const navigate = useNavigate();
  const { user: bakerUser } = useAuth();
  const isEditMode = Boolean(cakeId);

  const initialCakeState: Partial<Cake> = {
    name: '',
    category: 'other' as CakeCategory,
    description: '',
    price: 0,
    images: [], // Initialize with empty array for multiple images
    isAvailable: true,
    featured: false,
    ingredients: [],
    allergens: [],
    sizes: [{ label: 'Standard', servings: 10, price: 0 }], // Default size
  };

  const [cakeData, setCakeData] = useState<Partial<Cake>>(initialCakeState);
  const [loading, setLoading] = useState(false);
  const [newIngredient, setNewIngredient] = useState(''); // State for new ingredient input
  const [newAllergen, setNewAllergen] = useState(''); // State for new allergen input
  // State for new size inputs (label, servings, price)
  const [newSizeLabel, setNewSizeLabel] = useState('');
  const [newSizeServings, setNewSizeServings] = useState(0);
  const [newSizePrice, setNewSizePrice] = useState(0);

  // State for multiple images
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Files selected for upload
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // Existing image URLs from Firestore
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // URLs for displaying previews

  useEffect(() => {
    if (isEditMode && cakeId) {
      console.log('CakeForm in EDIT mode. Attempting to fetch cake with ID:', cakeId); // Log received cakeId
      const fetchCake = async () => {
        setLoading(true);
        try {
          const cakeDocRef = doc(db, 'cakes', cakeId);
          const cakeSnap = await getDoc(cakeDocRef);
          console.log('getDoc result for cakeId', cakeId, ':', cakeSnap.exists() ? 'Found' : 'Not Found'); // Log fetch result
          if (cakeSnap.exists()) {
            const fetchedCake = cakeSnap.data() as Cake;
            // Ensure bakerId matches if it's an edit operation by a baker
            if (bakerUser?.uid !== fetchedCake.bakerId) {
                showErrorToast("You are not authorized to edit this cake.");
                navigate("/baker-portal/manage-my-cakes");
                return;
            }
            setCakeData({ ...fetchedCake, id: cakeSnap.id });
            // Fetch existing images from Storage
            if (cakeId) { // Ensure cakeId is available for fetching images
                const urls = await getCakeImages(cakeId);
                setExistingImageUrls(urls);
                setImagePreviews(urls); // Set initial previews to existing images
            }
          } else {
            showErrorToast('Cake not found.');
            navigate('/baker-portal/manage-my-cakes');
          }
        } catch (error) {
          console.error("Error fetching cake:", error);
          showErrorToast('Failed to load cake details.');
        } finally {
          setLoading(false);
        }
      };
      fetchCake();
    } else {
      console.log('CakeForm in CREATE mode.'); // Log create mode
      setCakeData(initialCakeState); // Reset for new cake form
      setSelectedFiles([]); // Clear selected files
      setExistingImageUrls([]); // Clear existing images
      setImagePreviews([]); // Clear previews
    }
  }, [cakeId, isEditMode, navigate, bakerUser]); // Added bakerUser to dependencies

  // Effect to update image previews when selected files change
  useEffect(() => {
    const filePreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews([...existingImageUrls, ...filePreviews]);

    // Clean up object URLs when component unmounts or files change
    return () => {
      filePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles, existingImageUrls]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setCakeData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
    }));
  };

  // Handlers for Ingredients
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setCakeData(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), newIngredient.trim()],
      }));
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setCakeData(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index),
    }));
  };

  // Handlers for Allergens
  const handleAddAllergen = () => {
    if (newAllergen.trim()) {
      setCakeData(prev => ({
        ...prev,
        allergens: [...(prev.allergens || []), newAllergen.trim()],
      }));
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (index: number) => {
    setCakeData(prev => ({
      ...prev,
      allergens: (prev.allergens || []).filter((_, i) => i !== index),
    }));
  };

  // Handlers for Sizes
  const handleAddSize = () => {
    if (newSizeLabel.trim() && newSizeServings > 0 && newSizePrice >= 0) {
      const newSize: CakeSize = {
        label: newSizeLabel.trim(),
        servings: newSizeServings,
        price: newSizePrice,
      };
      setCakeData(prev => ({
        ...prev,
        sizes: [...(prev.sizes || []), newSize],
      }));
      setNewSizeLabel('');
      setNewSizeServings(0);
      setNewSizePrice(0);
    } else {
        showErrorToast("Please fill out all size fields correctly.");
    }
  };

  const handleRemoveSize = (index: number) => {
    setCakeData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter((_, i) => i !== index),
    }));
  };

  const handleSizeInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCakeData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).map((size, i) =>
        i === index ? { ...size, [name]: type === 'number' ? parseFloat(value) : value } : size
      ),
    }));
  };

  // Handlers for Images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if files exist and are not empty before proceeding
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and add to selectedFiles state
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      // Clear the input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    // Determine if the image is an existing one or a newly selected file
    if (index < existingImageUrls.length) {
      // It's an existing image, remove from existingImageUrls
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      // It's a newly selected file, remove from selectedFiles
      const fileIndex = index - existingImageUrls.length;
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bakerUser) {
      showErrorToast("You must be logged in.");
      return;
    }
    setLoading(true);

    let finalImageUrls: string[] = [...existingImageUrls]; // Start with existing images

    try {
      // 1. Upload new selected files
      if (selectedFiles.length > 0) {
        showInfoToast(`Uploading ${selectedFiles.length} image(s)...`);
        const newUrls = await uploadCakeImages(selectedFiles, bakerUser.uid, cakeId);
        finalImageUrls = [...finalImageUrls, ...newUrls]; // Add new URLs to the list
        showSuccessToast("Image(s) uploaded successfully!");
      }

      // 2. Determine which existing images were removed and delete them
      const removedImageUrls = existingImageUrls.filter(url => !finalImageUrls.includes(url));
      if (removedImageUrls.length > 0) {
          console.log("Deleting removed images:", removedImageUrls);
          // Delete removed images from Storage (fire and forget, don't block save)
          deleteCakeImagesByUrls(removedImageUrls).catch(err => console.error("Error deleting some images:", err));
      }


      // 3. Prepare data to save to Firestore
      const dataToSave = {
        ...cakeData,
        price: Number(cakeData.price) || 0,
        bakerId: bakerUser.uid, // Assign bakerId
        images: finalImageUrls, // Save the final list of image URLs
        updatedAt: serverTimestamp(),
      };

      // 4. Save cake data to Firestore
      if (isEditMode && cakeId) {
        const cakeDocRef = doc(db, 'cakes', cakeId);
        await setDoc(cakeDocRef, dataToSave, { merge: true });
        showSuccessToast('Cake updated successfully!');
      } else {
        const newCakeData = { ...dataToSave, createdAt: serverTimestamp() };
        await addDoc(collection(db, 'cakes'), newCakeData);
        showSuccessToast('Cake added successfully!');
      }
      navigate('/baker-portal/manage-my-cakes');
    } catch (error) {
      console.error("Error saving cake:", error);
      showErrorToast(`Failed to ${isEditMode ? 'update' : 'add'} cake.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && cakeId) { // Only show full page spinner when fetching existing cake
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">
        {isEditMode ? 'Edit Cake' : 'Add New Cake'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-body font-medium text-deepbrown/90">Cake Name</label>
          <input type="text" name="name" id="name" required value={cakeData.name || ''} onChange={handleInputChange} className="mt-1 block w-full input-class" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-body font-medium text-deepbrown/90">Description</label>
          <textarea name="description" id="description" rows={3} required value={cakeData.description || ''} onChange={handleInputChange} className="mt-1 block w-full input-class" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-body font-medium text-deepbrown/90">Price ($)</label>
            <input type="number" name="price" id="price" step="0.01" required value={cakeData.price || 0} onChange={handleInputChange} className="mt-1 block w-full input-class" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-body font-medium text-deepbrown/90">Category</label>
            <select name="category" id="category" required value={cakeData.category} onChange={handleInputChange} className="mt-1 block w-full select-class">
              <option value="birthday">Birthday</option>
              <option value="wedding">Wedding</option>
              <option value="celebration">Celebration</option>
              <option value="cupcakes">Cupcakes</option>
              <option value="seasonal">Seasonal</option>
              <option value="custom">Custom</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Image Upload UI */}
        <div>
          <label htmlFor="imageUpload" className="block text-sm font-body font-medium text-deepbrown/90 mb-2">Cake Images (Min 1, Max 5)</label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            multiple // Allow multiple file selection
            onChange={handleFileChange}
            className="block w-full text-sm text-warmgray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rosepink/10 file:text-hotpink hover:file:bg-rosepink/20"
          />
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4"> {/* Display previews */}
              {imagePreviews.map((previewUrl, index) => (
                <div key={index} className="relative w-full aspect-square rounded-md overflow-hidden border border-warmgray-200">
                  <img src={previewUrl} alt={`Cake Image ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
           {imagePreviews.length < 1 && (
               <p className="mt-2 text-sm text-red-600">At least one image is required.</p>
           )}
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <input type="checkbox" name="isAvailable" id="isAvailable" checked={cakeData.isAvailable || false} onChange={handleInputChange} className="h-4 w-4 text-hotpink border-warmgray-300 rounded focus:ring-hotpink" />
            <label htmlFor="isAvailable" className="ml-2 text-sm font-body text-deepbrown/90">Is Available?</label>
          </div>
          <div>
            <input type="checkbox" name="featured" id="featured" checked={cakeData.featured || false} onChange={handleInputChange} className="h-4 w-4 text-hotpink border-warmgray-300 rounded focus:ring-hotpink" />
            <label htmlFor="featured" className="ml-2 text-sm font-body text-deepbrown/90">Featured Cake?</label>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label htmlFor="newIngredient" className="block text-sm font-body font-medium text-deepbrown/90">Ingredients</label>
          <div className="flex space-x-2 mt-1">
            <input
              type="text"
              id="newIngredient"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient(); } }}
              className="block w-full input-class"
              placeholder="Add ingredient"
            />
            <button type="button" onClick={handleAddIngredient} className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown bg-white hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors">
              Add
            </button>
          </div>
          {(cakeData.ingredients || []).length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-warmgray-700 font-body">
              {(cakeData.ingredients || []).map((ingredient, index) => (
                <li key={index} className="flex justify-between items-center bg-warmgray-50 p-2 rounded">
                  {ingredient}
                  <button type="button" onClick={() => handleRemoveIngredient(index)} className="text-red-600 hover:text-red-800 text-xs ml-2">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Allergens */}
        <div>
          <label htmlFor="newAllergen" className="block text-sm font-body font-medium text-deepbrown/90">Allergens (Optional)</label>
          <div className="flex space-x-2 mt-1">
            <input
              type="text"
              id="newAllergen"
              value={newAllergen}
              onChange={(e) => setNewAllergen(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllergen(); } }}
              className="block w-full input-class"
              placeholder="Add allergen"
            />
            <button type="button" onClick={handleAddAllergen} className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown bg-white hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors">
              Add
            </button>
          </div>
           {(cakeData.allergens || []).length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-warmgray-700 font-body">
              {(cakeData.allergens || []).map((allergen, index) => (
                <li key={index} className="flex justify-between items-center bg-warmgray-50 p-2 rounded">
                  {allergen}
                  <button type="button" onClick={() => handleRemoveAllergen(index)} className="text-red-600 hover:text-red-800 text-xs ml-2">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-body font-medium text-deepbrown/90 mb-2">Sizes</label>
          <div className="space-y-3">
            {(cakeData.sizes || []).map((size, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-warmgray-50 p-3 rounded">
                <div className="md:col-span-1">
                  <label htmlFor={`size-label-${index}`} className="block text-xs font-body font-medium text-warmgray-700">Label</label>
                  <input
                    type="text"
                    id={`size-label-${index}`}
                    name="label"
                    value={size.label}
                    onChange={(e) => handleSizeInputChange(index, e)}
                    className="mt-1 block w-full input-class text-sm"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                   <label htmlFor={`size-servings-${index}`} className="block text-xs font-body font-medium text-warmgray-700">Servings</label>
                  <input
                    type="number"
                    id={`size-servings-${index}`}
                    name="servings"
                    value={size.servings}
                    onChange={(e) => handleSizeInputChange(index, e)}
                    className="mt-1 block w-full input-class text-sm"
                    required
                    min="1"
                  />
                </div>
                 <div className="md:col-span-1">
                   <label htmlFor={`size-price-${index}`} className="block text-xs font-body font-medium text-warmgray-700">Price ($)</label>
                  <input
                    type="number"
                    id={`size-price-${index}`}
                    name="price"
                    value={size.price}
                    onChange={(e) => handleSizeInputChange(index, e)}
                    className="mt-1 block w-full input-class text-sm"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="md:col-span-1 flex items-end justify-end">
                  <button type="button" onClick={() => handleRemoveSize(index)} className="px-3 py-2 border border-red-500 rounded-md text-xs font-medium font-body text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-center">
              <button type="button" onClick={handleAddSize} className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown bg-white hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors">
                Add Size
              </button>
            </div>
          </div>
        </div>


        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-warmgray-200 mt-8">
          <button type="button" onClick={() => navigate('/baker-portal/manage-my-cakes')} className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown bg-white hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading || imagePreviews.length < 1} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-hotpink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink disabled:opacity-50 transition-colors">
            {loading ? <LoadingSpinner /> : (isEditMode ? 'Update Cake' : 'Add Cake')}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper for input class reuse
const inputClass = "mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body";
const selectClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-warmgray-300 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm rounded-md font-body";


export default CakeForm;
