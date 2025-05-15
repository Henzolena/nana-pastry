import React from 'react';
import { Link } from 'react-router-dom';
import { Cake } from '@/types'; // Using path alias

interface CakeListItemProps {
  cake: Cake;
}

const CakeListItem: React.FC<CakeListItemProps> = ({ cake }) => {
  const displayImage = cake.images && cake.images.length > 0 ? cake.images[0] : cake.imageUrl || '/placeholder-cake.jpg';

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/cakes/${cake.id}`}>
        <img 
          src={displayImage} 
          alt={cake.name} 
          className="w-full h-48 object-cover rounded-md mb-4" 
          onError={(e) => (e.currentTarget.src = '/placeholder-cake.jpg')} // Fallback for broken image links
        />
        <h3 className="text-xl font-semibold mb-1">{cake.name}</h3>
      </Link>
      <p className="text-gray-600 text-sm mb-2 capitalize">{cake.category}</p>
      <p className="text-lg font-bold text-pink-500 mb-3">${cake.price.toFixed(2)}</p>
      <p className="text-gray-700 text-sm mb-3 truncate">{cake.description}</p>
      <div className="flex justify-between items-center">
        <Link
          to={`/cakes/${cake.id}`}
          className="text-pink-500 hover:text-pink-600 font-medium"
        >
          View Details
        </Link>
        {/* Future: Add to cart button could go here */}
      </div>
      {!cake.isAvailable && (
        <div className="mt-2 p-2 bg-yellow-100 text-yellow-700 text-xs rounded">
          Currently Unavailable
        </div>
      )}
    </div>
  );
};

export default CakeListItem;
