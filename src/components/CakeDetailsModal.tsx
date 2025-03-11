import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Cake } from '@/types';
import Modal from './ui/Modal';

interface CakeDetailsModalProps {
  cake: Cake | null;
  isOpen: boolean;
  onClose: () => void;
}

const CakeDetailsModal = ({ cake, isOpen, onClose }: CakeDetailsModalProps) => {
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!cake) return null;

  const calculatePrice = () => {
    const basePrice = cake.price;
    const sizeModifier = cake.sizes?.[selectedSize]?.priceModifier || 0;
    return (basePrice + sizeModifier) * quantity;
  };

  // For demo purposes, let's create multiple images
  const images = cake.images.length > 1 
    ? cake.images 
    : [cake.images[0], '/src/assets/images/cake-slice.jpg', '/src/assets/images/cake-top.jpg'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={cake.name}>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg bg-pink-50 aspect-square">
            <img 
              src={images[activeImageIndex]} 
              alt={cake.name}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            
            {/* Favorite Button */}
            <div className="absolute top-4 right-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-rosepink transition-colors"
              >
                <Heart size={18} />
              </motion.button>
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
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

        {/* Details */}
        <div className="space-y-6">
          {/* Price and Rating */}
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-medium text-deepbrown">
              ${calculatePrice().toFixed(2)}
            </p>
            
            <div className="flex items-center">
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
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{cake.description}</p>
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
          <div className="grid grid-cols-2 gap-4 p-4 bg-warmgray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-medium text-gray-700">Allergens</h4>
                <p className="text-xs text-gray-500">{cake.allergens?.join(', ') || 'None'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info size={16} className="text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-medium text-gray-700">Flavors</h4>
                <p className="text-xs text-gray-500">{cake.flavors?.join(', ') || 'None'}</p>
              </div>
            </div>
            {cake.ingredients && (
              <div className="col-span-2 flex items-start gap-2 mt-2">
                <Info size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-medium text-gray-700">Ingredients</h4>
                  <p className="text-xs text-gray-500">{cake.ingredients?.join(', ') || 'None'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-4 bg-hotpink text-white rounded-md font-medium flex items-center justify-center gap-2 hover:bg-hotpink/90 transition-colors shadow-sm"
          >
            <ShoppingBag size={18} />
            Add to Cart - ${calculatePrice().toFixed(2)}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default CakeDetailsModal; 