import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/utils/cn';

const CartIcon = () => {
  const { state, toggleCart } = useCart();
  
  // Safely calculate total items, defaulting to 0 if items is undefined or null
  const totalItems = state.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <button 
      onClick={() => toggleCart()} 
      className="relative p-2 rounded-full hover:bg-blush/20 transition-colors duration-200 group"
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <ShoppingCart className="w-6 h-6 text-deepbrown group-hover:text-hotpink" />
      {totalItems > 0 && (
        <span 
          className={cn(
            "absolute -top-1 -right-1 flex items-center justify-center w-5 h-5",
            "text-xs font-bold text-white bg-hotpink rounded-full",
            "border-2 border-white group-hover:border-blush/20"
          )}
        >
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default CartIcon; 