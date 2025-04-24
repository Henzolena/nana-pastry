import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCakeById } from '@/services/firestore';
import { ShoppingBag, Star, Info, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Cake } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import FavoriteButton from '@/components/FavoriteButton';
import { toast } from 'sonner';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const ProductDetail = () => {
  const { cakeId } = useParams<{ cakeId: string }>();
  const navigate = useNavigate();
  const { addItem, } = useCart();
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadCake() {
      if (!cakeId) {
        setError('No cake ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cakeData = await getCakeById(cakeId);
        if (cakeData) {
          setCake(cakeData);
          // Reset state when a new cake is loaded
          setQuantity(1);
          setSelectedSize(0);
          setActiveImageIndex(0);
          setAddedToCart(false);
        } else {
          setError('Cake not found');
        }
      } catch (err) {
        console.error('Error loading cake:', err);
        setError('Failed to load cake details');
      } finally {
        setLoading(false);
      }
    }

    loadCake();
  }, [cakeId]);

  const handleAddToCart = () => {
    if (!cake) return;

    const size = cake.sizes && cake.sizes.length > 0 
      ? cake.sizes[selectedSize]
      : { 
          label: 'Standard', 
          servings: 8, 
          price: cake.price 
        };
    
    addItem(cake, size, quantity);
    
    setAddedToCart(true);
    toast.success('Added to cart!');
    
    // Reset after 1.5 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 1500);
  };

  // Calculate current price based on selected size
  const calculatePrice = () => {
    if (!cake) return 0;
    if (cake.sizes && cake.sizes.length > 0) {
      return cake.sizes[selectedSize].price;
    }
    return cake.price;
  };

  if (loading) {
    return (
      <div className="container mx-auto pt-32 pb-16 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hotpink"></div>
        </div>
      </div>
    );
  }

  if (error || !cake) {
    return (
      <div className="container mx-auto pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-deepbrown mb-4">
            {error || 'Cake not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the cake you're looking for.
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-hotpink hover:bg-hotpink/90 text-white rounded-md inline-flex items-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse All Cakes
          </button>
        </div>
      </div>
    );
  }

  const images = cake.images || [];

  return (
    <div className="container mx-auto pt-32 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-hotpink transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Image Column */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-pink-50 aspect-square">
              <img 
                src={images[activeImageIndex]} 
                alt={cake.name}
                className="w-full h-full object-cover"
              />
              
              {/* Favorite Button */}
              <div className="absolute top-4 right-4 z-10">
                <FavoriteButton 
                  productId={cake.id} 
                  size="md" 
                  className="bg-white shadow-md"
                />
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === index 
                        ? 'border-rosepink ring-2 ring-rosepink/20' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${cake.name} - view ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-deepbrown mb-2">{cake.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < 4 ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">4.0 (24 reviews)</span>
              </div>
              <p className="text-2xl font-medium text-deepbrown mb-6">
                {formatCurrency(calculatePrice())}
              </p>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p>{cake.description}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100"></div>

            {/* Sizes */}
            {cake.sizes && cake.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {cake.sizes.map((size, index) => (
                    <button
                      key={index}
                      className={`px-3 py-2 border rounded-md text-sm transition-all ${
                        selectedSize === index 
                          ? 'border-rosepink bg-rosepink/10 text-rosepink' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSize(index)}
                    >
                      {size.label}
                      <span className="block text-xs text-gray-500">
                        Serves {size.servings}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quantity</h3>
              <div className="flex items-center">
                <button 
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <div className="w-14 h-10 flex items-center justify-center border-t border-b border-gray-300 font-medium">
                  {quantity}
                </div>
                <button 
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-50"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-warmgray-50 rounded-lg">
              {cake.allergens && (
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-medium text-gray-700">Allergens</h4>
                    <p className="text-xs text-gray-500">{cake.allergens.join(', ') || 'None'}</p>
                  </div>
                </div>
              )}
              {cake.flavors && (
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-medium text-gray-700">Flavors</h4>
                    <p className="text-xs text-gray-500">{cake.flavors.join(', ') || 'None'}</p>
                  </div>
                </div>
              )}
              {cake.ingredients && (
                <div className="col-span-2 flex items-start gap-2 mt-2">
                  <Info size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-medium text-gray-700">Ingredients</h4>
                    <p className="text-xs text-gray-500">{cake.ingredients.join(', ') || 'None'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart & Customize Buttons */}
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-4 ${
                  addedToCart 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-hotpink hover:bg-hotpink/90'
                } text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors shadow-sm`}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Add to Cart
                  </>
                )}
              </motion.button>
              
              <button 
                onClick={() => navigate(`/products/customize/${cake.id}`)}
                className="w-full py-3 px-4 border border-deepbrown text-deepbrown rounded-md font-medium hover:bg-deepbrown/5 transition-colors"
              >
                Customize This Cake
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail; 