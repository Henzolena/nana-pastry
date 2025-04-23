import React from 'react';
import { X, ShoppingBag, ChevronRight, Minus, Plus, Trash } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatters'; // We'll create this utility

const CartItem: React.FC<{ id: string; name: string; price: number; quantity: number; image: string; }> = ({
  id,
  name,
  price,
  quantity,
  image,
}) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex py-4 border-b border-gray-100">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3 className="text-sm">{name}</h3>
            <p className="ml-4">{formatCurrency(price * quantity)}</p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(id, quantity - 1)}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-gray-500">{quantity}</span>
            <button
              onClick={() => updateQuantity(id, quantity + 1)}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(id)}
            className="font-medium text-pink-600 hover:text-pink-800"
            aria-label="Remove item"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MiniCart: React.FC = () => {
  const { state, toggleCart } = useCart();
  const { items = [], subtotal, isOpen } = state;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={() => toggleCart(false)}
        ></div>

        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      className="p-2 -m-2 text-gray-400 hover:text-gray-500"
                      onClick={() => toggleCart(false)}
                    >
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  {items && items.length > 0 ? (
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {items.map((item) => (
                          <li key={item.id} className="py-6">
                            <CartItem
                              id={item.id}
                              name={item.name}
                              price={item.price}
                              quantity={item.quantity}
                              image={item.image}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start adding some delicious treats!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {items && items.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>{formatCurrency(subtotal)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/checkout"
                      className={cn(
                        "flex items-center justify-center rounded-md border border-transparent",
                        "bg-pink-600 px-6 py-3 text-base font-medium text-white shadow-sm",
                        "hover:bg-pink-700 transition-colors duration-200"
                      )}
                    >
                      Checkout
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or{' '}
                      <button
                        type="button"
                        className="font-medium text-pink-600 hover:text-pink-800"
                        onClick={() => toggleCart(false)}
                      >
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniCart; 