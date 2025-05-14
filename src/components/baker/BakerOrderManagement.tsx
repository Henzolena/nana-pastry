import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Clock, RefreshCw } from 'lucide-react';
import { getOrder, Order } from '@/services/order';
import OrderManagement from '@/components/baker/OrderManagement';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const BakerOrderManagement: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(true);
  
  // Fetch order details
  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const orderData = await getOrder(orderId);
      setOrder(orderData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);
  
  // Handle order update
  const handleOrderUpdated = () => {
    showSuccessToast('Order updated successfully');
    fetchOrderDetails(); // Refresh order data
  };
  
  // Handle go back
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotpink"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md inline-flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the order you're looking for.
        </p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-hotpink hover:bg-hotpink/90 text-white rounded-md inline-flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleGoBack}
          className="text-gray-600 hover:text-hotpink flex items-center transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>
        
        <button
          onClick={fetchOrderDetails}
          className="text-gray-600 hover:text-hotpink flex items-center transition-colors"
        >
          <RefreshCw className="h-5 w-5 mr-1" />
          Refresh
        </button>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Order Management
      </h1>
      <p className="text-gray-500 mb-6">
        Order #{order.id.slice(0, 8).toUpperCase()} - Placed on {formatDate(order.createdAt)}
      </p>
      
      {/* Order Management Controls */}
      <div className="mb-8">
        <OrderManagement order={order} onOrderUpdated={handleOrderUpdated} />
      </div>
      
      {/* Order Status Timeline */}
      <div className="mb-8">
        <OrderStatusTracker order={order} />
      </div>
      
      {/* Order Items Collapsible */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div 
          className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
          onClick={() => setShowItems(!showItems)}
        >
          <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          {showItems ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {showItems && (
          <div className="p-4">
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-start border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  {item.imageUrl && (
                    <div className="h-16 w-16 rounded-md overflow-hidden mr-4 border border-gray-200">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <div className="mt-1 text-sm text-gray-600">
                        {item.customizations.size && (
                          <p>Size: {item.customizations.size}</p>
                        )}
                        {item.customizations.flavors && item.customizations.flavors.length > 0 && (
                          <p>Flavors: {item.customizations.flavors.join(', ')}</p>
                        )}
                        {item.customizations.fillings && item.customizations.fillings.length > 0 && (
                          <p>Fillings: {item.customizations.fillings.join(', ')}</p>
                        )}
                        {item.customizations.frostings && item.customizations.frostings.length > 0 && (
                          <p>Frostings: {item.customizations.frostings.join(', ')}</p>
                        )}
                        {item.customizations.shape && (
                          <p>Shape: {item.customizations.shape}</p>
                        )}
                        {item.customizations.specialInstructions && (
                          <p className="mt-1 text-rose-600">
                            <span className="font-medium">Special Instructions:</span> {item.customizations.specialInstructions}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">{formatCurrency(order.subtotal)}</p>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <p className="text-gray-600">Tax</p>
                <p className="font-medium">{formatCurrency(order.tax)}</p>
              </div>
              {order.deliveryMethod === 'delivery' && order.deliveryInfo && (
                <div className="flex justify-between text-sm mt-2">
                  <p className="text-gray-600">Delivery Fee</p>
                  <p className="font-medium">{formatCurrency(order.deliveryInfo.deliveryFee)}</p>
                </div>
              )}
              <div className="flex justify-between font-medium mt-4 pt-4 border-t border-gray-100">
                <p>Total</p>
                <p className="text-hotpink">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Details</h3>
              <p className="font-medium">{order.customerInfo.name}</p>
              <p className="text-gray-700">{order.customerInfo.email}</p>
              <p className="text-gray-700">{order.customerInfo.phone}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {order.deliveryMethod === 'delivery' ? 'Delivery Details' : 'Pickup Details'}
              </h3>
              
              {order.deliveryMethod === 'delivery' && order.deliveryInfo ? (
                <div>
                  <p>{order.deliveryInfo.address}</p>
                  <p>{order.deliveryInfo.city}, {order.deliveryInfo.state} {order.deliveryInfo.zipCode}</p>
                  <p className="mt-2">
                    <span className="font-medium">Delivery Date:</span>{' '}
                    {formatDate(order.deliveryInfo.deliveryDate, { fallback: 'To be determined' })}
                    {order.deliveryInfo.deliveryTime && ` (${order.deliveryInfo.deliveryTime})`}
                  </p>
                </div>
              ) : order.pickupInfo ? (
                <div>
                  <p>
                    <span className="font-medium">Pickup Date:</span>{' '}
                    {formatDate(order.pickupInfo.pickupDate, { fallback: 'To be determined' })}
                  </p>
                  <p>
                    <span className="font-medium">Pickup Time:</span>{' '}
                    {order.pickupInfo.pickupTime || 'To be determined'}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{' '}
                    {order.pickupInfo.storeLocation || 'Main Store'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No details available</p>
              )}
            </div>
          </div>
          
          {order.specialInstructions && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</h3>
              <p className="text-sm text-yellow-800">{order.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BakerOrderManagement;
