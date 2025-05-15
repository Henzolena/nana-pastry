import React from 'react';
import { Cake, CakeSize } from '@/types';

interface CakeDetailProps {
  cake: Cake;
}

const CakeDetail: React.FC<CakeDetailProps> = ({ cake }) => {
  const displayImage = cake.images && cake.images.length > 0 ? cake.images[0] : cake.imageUrl || '/placeholder-cake.jpg';

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <img 
        src={displayImage} 
        alt={cake.name} 
        className="w-full h-64 md:h-96 object-cover"
        onError={(e) => (e.currentTarget.src = '/placeholder-cake.jpg')}
      />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{cake.name}</h1>
        <p className="text-xl text-pink-500 font-semibold mb-4">${cake.price.toFixed(2)}</p>
        
        <div className="mb-4">
          <span className="text-sm font-semibold bg-pink-100 text-pink-700 px-3 py-1 rounded-full capitalize">
            {cake.category}
          </span>
          {cake.featured && (
            <span className="ml-2 text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Featured
            </span>
          )}
          {!cake.isAvailable && (
            <span className="ml-2 text-sm font-semibold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              Currently Unavailable
            </span>
          )}
        </div>

        <p className="text-gray-700 mb-6">{cake.description}</p>

        {cake.sizes && cake.sizes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Available Sizes:</h3>
            <ul className="list-disc list-inside pl-2">
              {cake.sizes.map((size: CakeSize, index: number) => (
                <li key={index} className="text-gray-600">
                  {size.label} (Serves {size.servings}) - ${size.price.toFixed(2)}
                  {size.priceModifier ? ` (Modifier: ${size.priceModifier.toFixed(2)})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {cake.ingredients && cake.ingredients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ingredients:</h3>
            <p className="text-gray-600">{cake.ingredients.join(', ')}</p>
          </div>
        )}

        {cake.allergens && cake.allergens.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Allergens:</h3>
            <p className="text-gray-600">{cake.allergens.join(', ')}</p>
          </div>
        )}
        
        {/* Add to Cart Button / Customization Link could go here */}
        <div className="mt-6">
          <button 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out disabled:opacity-50"
            disabled={!cake.isAvailable}
          >
            {cake.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
         {cake.bakerId && <p className="text-xs text-gray-500 mt-4">Baker ID: {cake.bakerId}</p>}
      </div>
    </div>
  );
};

export default CakeDetail;
