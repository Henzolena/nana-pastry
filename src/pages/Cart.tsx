import React from 'react';
import { Minus, Plus, Trash, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const Cart: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { items, subtotal, tax, total } = state;

  // Page animations
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="mx-auto"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div
        className="relative min-h-[30vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 192, 203, 0.7), rgba(255, 245, 238, 0.9)), url('/src/assets/images/cakes-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          width: '100%',
          marginTop: '0',
          paddingTop: '6rem',
          paddingBottom: '3rem'
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gold-shimmer opacity-30"></div>
        
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-deepbrown mb-6">Your Shopping Cart</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {(items?.length ?? 0) === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-full w-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Check out our delicious
              cakes and pastries to find something you'll love!
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Items ({items.length})</h2>
                    <button
                      onClick={clearCart}
                      className="text-sm text-pink-600 hover:text-pink-800"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                              <p className="mt-1 text-sm text-gray-500">{item.size.label} ({item.size.servings} servings)</p>
                              {item.specialInstructions && (
                                <p className="mt-1 text-sm text-gray-500">
                                  <span className="font-medium">Special instructions:</span> {item.specialInstructions}
                                </p>
                              )}
                            </div>
                            <p className="text-base font-medium text-gray-900">
                              {formatCurrency(item.price)}
                            </p>
                          </div>

                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center border border-gray-200 rounded">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className={cn(
                                  "p-2 rounded-l hover:bg-gray-50 transition-colors",
                                  "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-2 text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 rounded-r hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm font-medium text-pink-600 hover:text-pink-800 flex items-center"
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax (estimated)</span>
                    <span className="text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-pink-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/checkout"
                    className={cn(
                      "w-full flex items-center justify-center rounded-md border border-transparent",
                      "bg-pink-600 px-6 py-3 text-base font-medium text-white shadow-sm",
                      "hover:bg-pink-700 transition-colors duration-200"
                    )}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    to="/products"
                    className={cn(
                      "w-full flex items-center justify-center rounded-md border border-gray-300",
                      "bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm",
                      "hover:bg-gray-50 transition-colors duration-200"
                    )}
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Cart; 