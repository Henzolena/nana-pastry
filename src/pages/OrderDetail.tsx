import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle, Truck, Home, AlertTriangle, ShoppingBag } from 'lucide-react';
import { getOrder, Order } from '@/services/order';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatters';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const orderData = await getOrder(orderId);
        
        // Security check - only allow viewing own orders
        if (user?.uid && orderData.userId && orderData.userId !== user.uid) {
          setError('You do not have permission to view this order');
          setLoading(false);
          return;
        }
        
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrderDetails();
  }, [orderId, user?.uid]);

  // Format date for display
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Date unavailable';
    
    try {
      let dateObject: Date | null = null;
      
      // Case 1: Firestore Timestamp object with toDate method
      if (timestamp && typeof timestamp.toDate === 'function') {
        dateObject = timestamp.toDate();
      }
      // Case 2: Already a Date object
      else if (timestamp instanceof Date) {
        dateObject = timestamp;
      }
      // Case 3: String date
      else if (typeof timestamp === 'string') {
        dateObject = new Date(timestamp);
      }
      // Case 4: Timestamp number (milliseconds since epoch)
      else if (typeof timestamp === 'number') {
        dateObject = new Date(timestamp);
      }
      // Case 5: Object with seconds property (Firestore server timestamp format)
      else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        // Convert seconds to milliseconds
        const milliseconds = timestamp.seconds * 1000;
        // Add nanoseconds if available
        dateObject = new Date(milliseconds + (timestamp.nanoseconds ? timestamp.nanoseconds / 1000000 : 0));
      }
      
      // Validate the date object
      if (!dateObject || isNaN(dateObject.getTime())) {
        console.warn('Invalid date created from:', timestamp);
        return 'Invalid date';
      }
      
      // Format the date
      return dateObject.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, timestamp);
      return 'Invalid date';
    }
  };

  // Get order status badge style
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle go back
  const handleGoBack = () => {
    navigate(-1); // This will go back to the previous page
  };

  if (loading) {
    return (
      <div className="container mx-auto pt-36 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotpink"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto pt-36 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <AlertTriangle className="h-5 w-5 inline-block mr-2" />
            {error}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md inline-flex items-center transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto pt-36 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link
            to="/account?tab=orders"
            className="px-4 py-2 bg-hotpink hover:bg-hotpink/90 text-white rounded-md inline-flex items-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-36 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-hotpink flex items-center transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Order Reference</p>
            <p className="font-medium text-lg">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getStatusBadgeClass(order.status)
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-gray-400" />
                  Items Ordered
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start">
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
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    {order.deliveryMethod === 'pickup' ? (
                      <>
                        <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                        Pickup Information
                      </>
                    ) : (
                      <>
                        <Truck className="h-5 w-5 mr-2 text-gray-400" />
                        Delivery Information
                      </>
                    )}
                  </h3>
                  
                  {order.deliveryMethod === 'pickup' && order.pickupInfo && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="text-sm text-gray-500">Pickup Details</p>
                        <p className="font-medium">
                          {order.pickupInfo.storeLocation || 'Main Store'}
                        </p>
                        <p className="font-medium">
                          {order.pickupInfo.pickupDate ? formatDate(order.pickupInfo.pickupDate) : 'Date not specified'} 
                          {order.pickupInfo.pickupTime && ` (${order.pickupInfo.pickupTime})`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {order.deliveryMethod === 'delivery' && order.deliveryInfo && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Delivery Address</p>
                        <p className="font-medium">{order.deliveryInfo.address}</p>
                        <p className="font-medium">
                          {order.deliveryInfo.city}, {order.deliveryInfo.state} {order.deliveryInfo.zipCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Delivery</p>
                        <p className="font-medium">
                          {order.deliveryInfo.deliveryDate ? formatDate(order.deliveryInfo.deliveryDate) : 'Date not specified'} 
                          {order.deliveryInfo.deliveryTime && ` (${order.deliveryInfo.deliveryTime})`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Home className="h-5 w-5 mr-2 text-gray-400" />
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {order.customerInfo ? (
                      <>
                        <p className="font-medium">{order.customerInfo.name}</p>
                        <p className="text-gray-700">{order.customerInfo.email}</p>
                        <p className="text-gray-700">{order.customerInfo.phone}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">Customer information not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {order.specialInstructions && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Special Instructions</h3>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <p className="text-gray-800">{order.specialInstructions}</p>
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">{formatCurrency(order.subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Tax</p>
                  <p className="font-medium">{formatCurrency(order.tax)}</p>
                </div>
                {order.deliveryMethod === 'delivery' && order.deliveryInfo && (
                  <div className="flex justify-between">
                    <p className="text-gray-600">Delivery Fee</p>
                    <p className="font-medium">{formatCurrency(order.deliveryInfo.deliveryFee)}</p>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-200 text-lg">
                  <p className="font-semibold">Total</p>
                  <p className="font-bold text-hotpink">{formatCurrency(order.total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link
            to="/account?tab=orders"
            className="px-4 py-2 bg-hotpink hover:bg-hotpink/90 text-white rounded-md inline-flex items-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Order History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 