import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Cake, CakeCategory } from '@/types'; // Import CakeCategory
// Firebase direct imports for importStaticCakes (will be refactored or removed later)
import { db } from '@/lib/firebase'; 
import { collection, addDoc, serverTimestamp, FieldValue } from 'firebase/firestore'; // Added FieldValue
// API service imports
import { getCakesByBakerId, deleteCake as apiDeleteCake } from '@/services/cakeApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import { cakes as staticCakes } from '@/utils/data'; // Import static cake data
// import { deleteCakeImage } from '@/services/storage'; // Placeholder for image deletion

const MyCakesList: React.FC = () => {
  const { user: bakerUser } = useAuth();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [categoryFilter, setCategoryFilter] = useState(''); // State for category filter
  const [availabilityFilter, setAvailabilityFilter] = useState(''); // State for availability filter ('all', 'available', 'unavailable')
  const [featuredFilter, setFeaturedFilter] = useState(''); // State for featured filter ('all', 'featured', 'not-featured')


  const handleImportStaticCakes = async () => {
    if (!bakerUser) {
      showErrorToast("You must be logged in to import cakes.");
      return;
    }
    setLoading(true);
    let importedCount = 0;
    try {
      const cakesCollectionRef = collection(db, 'cakes');
      for (const staticCake of staticCakes) {
        // Map static data to Cake interface, adding missing fields
        // Omit the original 'id' from staticCake
        const { id, ...staticCakeWithoutId } = staticCake;

        // Type for direct Firestore addDoc, allowing FieldValue for timestamps
        type CakeForFirestoreImport = Omit<Partial<Cake>, 'createdAt' | 'updatedAt'> & {
          createdAt?: FieldValue; 
          updatedAt?: FieldValue;
        };

        const cakeToImport: CakeForFirestoreImport = { 
          ...staticCakeWithoutId, // Use data without the original id
          // Assuming static data uses 'images' array, take the first one for 'imageUrl'
          imageUrl: (staticCakeWithoutId as any).images && (staticCakeWithoutId as any).images.length > 0 ? (staticCakeWithoutId as any).images[0] : '',
          isAvailable: true, // Default to available
          bakerId: bakerUser.uid, // Assign current baker as owner
          createdAt: serverTimestamp(), // Add server timestamp
          updatedAt: serverTimestamp(), // Add server timestamp
          // Ensure other fields like ingredients, allergens, sizes are copied if they exist
          ingredients: staticCakeWithoutId.ingredients || [],
          allergens: staticCakeWithoutId.allergens || [],
          sizes: staticCakeWithoutId.sizes || [],
        };

        // Remove the original 'images' field if it exists in static data before adding
        const { images, ...restOfCake } = cakeToImport as any; // Destructure to exclude 'images'
        
        await addDoc(cakesCollectionRef, restOfCake); // Add document, Firestore generates ID
        importedCount++;
      }
      showSuccessToast(`Successfully imported ${importedCount} static cakes!`);
      fetchBakerCakes(); // Refresh the list after import
    } catch (error) {
      console.error("Error importing static cakes:", error);
      showErrorToast(`Failed to import static cakes. Imported ${importedCount} before error.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchBakerCakes = async () => {
    if (!bakerUser) return;
    setLoading(true);
    try {
      const bakerCakes = await getCakesByBakerId(bakerUser.uid);
      setCakes(bakerCakes);
    } catch (error: any) {
      console.error("Error fetching baker's cakes:", error);
      showErrorToast(error.message || "Failed to fetch your cakes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bakerUser) {
      fetchBakerCakes();
    }
  }, [bakerUser]);

  const handleDeleteCake = async (cakeId: string) => {
    if (!window.confirm(`Are you sure you want to delete this cake? This action cannot be undone.`)) {
      return;
    }
    try {
      setLoading(true);
      await apiDeleteCake(cakeId);
      // TODO: Image deletion from storage if images are stored and managed via Firebase Storage.
      // This would involve getting image URLs from the cake object and calling a storage service.
      // For now, focusing on Firestore data deletion via API.
      showSuccessToast('Cake deleted successfully.');
      fetchBakerCakes(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting cake:", error);
      showErrorToast(error.message || 'Failed to delete cake.');
    } finally {
      setLoading(false); // Ensure loading is set to false in all cases
    }
  };

  // Apply filters and search to the cakes list
  const filteredCakes = cakes.filter(cake => {
    const matchesSearchTerm = (
      cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cake.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesCategory = categoryFilter ? cake.category === categoryFilter : true;
    const matchesAvailability = availabilityFilter ? 
      (availabilityFilter === 'available' ? cake.isAvailable : !cake.isAvailable) : true;
    const matchesFeatured = featuredFilter ?
      (featuredFilter === 'featured' ? cake.featured : !cake.featured) : true;

    return matchesSearchTerm && matchesCategory && matchesAvailability && matchesFeatured;
  });


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-heading font-semibold text-deepbrown">Manage My Cakes</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleImportStaticCakes}
            disabled={loading} // Disable while importing or loading
            className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown bg-white hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import Static Cakes'}
          </button>
          <Link
            to="/baker-portal/manage-my-cakes/new"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-hotpink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors"
          >
            Add New Cake
          </Link>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or description..."
          className="w-full p-3 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink font-body text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full p-3 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink font-body text-sm"
        >
          <option value="">All Categories</option>
          <option value="birthday">Birthday</option>
          <option value="wedding">Wedding</option>
          <option value="celebration">Celebration</option>
          <option value="cupcakes">Cupcakes</option>
          <option value="seasonal">Seasonal</option>
          <option value="custom">Custom</option>
          <option value="other">Other</option>
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="w-full p-3 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink font-body text-sm"
        >
          <option value="">All Availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="w-full p-3 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink font-body text-sm"
        >
          <option value="">All Featured</option>
          <option value="featured">Featured</option>
          <option value="not-featured">Not Featured</option>
        </select>
      </div>


      {filteredCakes.length === 0 && !loading ? (
        <p className="text-warmgray-600 font-body text-center py-4">No cakes found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCakes.map((cake) => {
            const displayImage = (cake.images && cake.images.length > 0 ? cake.images[0] : cake.imageUrl) || '/placeholder-cake.jpg';
            return (
            <div key={cake.id} className="border border-warmgray-200 rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <img 
                src={displayImage} 
                alt={cake.name} 
                className="w-full h-48 object-cover rounded-md mb-3" 
                onError={(e) => (e.currentTarget.src = '/placeholder-cake.jpg')}
              />
              <h3 className="text-lg font-heading text-hotpink font-semibold mb-1">{cake.name}</h3>
              <p className="text-sm font-body text-warmgray-600 mb-1 capitalize">Category: {cake.category}</p>
              <p className="text-sm font-body text-deepbrown font-semibold mb-2">Price: ${cake.price.toFixed(2)}</p>
              <p className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full inline-block mb-3 ${cake.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {cake.isAvailable ? 'Available' : 'Unavailable'}
              </p>
              <div className="mt-auto flex space-x-2 pt-3 border-t border-warmgray-100">
                <Link
                  to={`/baker-portal/manage-my-cakes/edit/${cake.id}`} // Use Firestore document ID
                  className="flex-1 text-center px-3 py-2 border border-hotpink rounded-md text-sm font-medium font-body text-hotpink hover:bg-hotpink hover:text-white transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteCake(cake.id)}
                  className="flex-1 px-3 py-2 border border-red-500 rounded-md text-sm font-medium font-body text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default MyCakesList;
