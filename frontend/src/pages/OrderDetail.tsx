import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Truck, Home, AlertTriangle, ShoppingBag, Check } from 'lucide-react';
import { getOrder, Order, processCashAppPayment } from '@/services/order';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/cn';

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
        
        // Security check - only allow viewing own orders if user is logged in
        // However, allow guest users to view orders by direct URL access
        if (user?.uid && orderData.userId && orderData.userId !== user.uid) {
          // Only check permissions for authenticated users viewing orders with userIds
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
        
        {/* Order Status Tracker */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <OrderStatusTracker order={order} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-500">Placed on {formatDate(order.createdAt, { type: 'dateTime', fallback: 'Date unavailable' })}</p>
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
                
                {/* Payment Status */}
                <div className="flex justify-between pt-3">
                  <p className="text-gray-600">Payment Status</p>
                  <p className="font-medium">
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </p>
                </div>
                
                {/* Amount Paid and Balance */}
                {order.amountPaid !== undefined && (
                  <div className="flex justify-between">
                    <p className="text-gray-600">Amount Paid</p>
                    <p className="font-medium">{formatCurrency(order.amountPaid)}</p>
                  </div>
                )}
                
                {order.balanceDue !== undefined && (
                  <div className="flex justify-between">
                    <p className="text-gray-600">Balance Due</p>
                    <p className="font-medium">{formatCurrency(order.balanceDue)}</p>
                  </div>
                )}
                
                {/* Payment Method */}
                <div className="flex justify-between">
                  <p className="text-gray-600">Payment Method</p>
                  <p className="font-medium">
                    {order.paymentMethod === 'credit-card' 
                      ? 'Credit Card' 
                      : order.paymentMethod === 'cash-app'
                        ? 'Cash App'
                        : 'Cash on Delivery'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cash App Payment Instructions */}
        {order.paymentMethod === 'cash-app' && 
         (order.paymentStatus === 'unpaid' || order.paymentStatus === 'pending' || order.paymentStatus === 'partial') && (
          <div className="bg-blue-50 rounded-lg shadow-md overflow-hidden border border-blue-100 mb-8">
            <div className="p-6">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Cash App Payment Instructions</h3>
              <div className="space-y-4">
                <p className="text-blue-700">
                  Please complete your payment using Cash App to continue processing your order:
                </p>
                <ol className="list-decimal ml-5 space-y-2 text-blue-700">
                  <li>Open your Cash App</li>
                  <li>Send payment to <span className="font-bold">$Ribka Melka</span></li>
                  <li>Include your Order # {order.id.slice(0, 8).toUpperCase()} in the payment notes</li>
                  <li>After payment, submit your confirmation ID below</li>
                </ol>
                <div className="bg-white p-4 rounded-md border border-blue-200 mt-4">
                  <p className="font-medium text-blue-800 mb-3">Balance Due: {formatCurrency(order.balanceDue || order.total)}</p>
                  
                  {/* Cash App Confirmation ID Update Form */}
                  <div className="mt-4">
                    <CashAppConfirmationForm orderId={order.id} existingConfirmationId={order.payments?.[0]?.cashAppDetails?.confirmationId} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Account Creation Prompt for Guest Users */}
        {!user && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-md mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Create an account to track your orders</h3>
            <p className="text-blue-700 mb-4">
              By creating an account, you can easily:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1 text-blue-700">
              <li>Track the status of your current and future orders</li>
              <li>View your order history at any time</li>
              <li>Save your favorite cake designs</li>
              <li>Receive special offers and discounts</li>
            </ul>
            <Link 
              to={`/auth?redirect=/orders/${orderId}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Create Account or Sign In
            </Link>
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link
            to={user ? "/account?tab=orders" : "/"}
            className="px-4 py-2 bg-hotpink hover:bg-hotpink/90 text-white rounded-md inline-flex items-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {user ? "Return to Order History" : "Return to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
};

// Cash App Confirmation Form Component
interface CashAppConfirmationFormProps {
  orderId: string;
  existingConfirmationId?: string;
}

const CashAppConfirmationForm: React.FC<CashAppConfirmationFormProps> = ({ orderId, existingConfirmationId }) => {
  const [confirmationId, setConfirmationId] = useState(existingConfirmationId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateConfirmationId = (value: string): boolean => {
    if (!value.trim()) {
      setError('Confirmation ID is required');
      return false;
    }
    
    if (value.trim().length < 5) {
      setError('Confirmation ID should be at least 5 characters');
      return false;
    }
    
    if (!/^[a-zA-Z0-9#-]*$/.test(value)) {
      setError('Confirmation ID contains invalid characters');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateConfirmationId(confirmationId) || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setIsSuccess(false);
      
      // Process payment with the full order amount
      await processCashAppPayment(
        orderId,
        0, // Amount will be determined by backend based on order total
        confirmationId,
        'Confirmation ID submitted by customer'
      );
      
      setIsSuccess(true);
      toast.success('Cash App confirmation ID submitted successfully!');
      
      // Reset form after success
      setTimeout(() => {
        window.location.reload(); // Refresh to show updated order status
      }, 2000);
    } catch (error) {
      console.error('Error submitting confirmation ID:', error);
      setError('Failed to submit confirmation ID. Please try again.');
      toast.error('Failed to submit confirmation ID');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-sm font-medium text-blue-800">Submit Cash App Confirmation</h4>
      {existingConfirmationId && (
        <div className="text-sm text-blue-700 mb-2">
          <span className="font-medium">Current Confirmation ID:</span> {existingConfirmationId}
        </div>
      )}
      
      <div>
        <label htmlFor="confirmationId" className="block text-sm font-medium text-gray-700 mb-1">
          {existingConfirmationId ? 'Update Confirmation ID' : 'Cash App Confirmation ID / Receipt Number'}
        </label>
        <input
          type="text"
          id="confirmationId"
          value={confirmationId}
          onChange={(e) => setConfirmationId(e.target.value)}
          placeholder="Enter the Cash App confirmation ID (e.g., #C4R7B2L5)"
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm font-mono tracking-wide",
            error ? "border-red-500" : ""
          )}
          maxLength={30}
          disabled={isSubmitting || isSuccess}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Find your confirmation ID in your Cash App receipt, usually labeled as "Confirmation #" or "Receipt ID"
        </p>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || isSuccess}
        className={cn(
          "w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink",
          isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-hotpink hover:bg-hotpink/90",
          (isSubmitting || isSuccess) ? "opacity-70 cursor-not-allowed" : ""
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Submitting...
          </span>
        ) : isSuccess ? (
          <span className="flex items-center justify-center">
            <Check className="h-4 w-4 mr-2" />
            Submitted Successfully
          </span>
        ) : (
          'Submit Confirmation ID'
        )}
      </button>
    </form>
  );
};

export default OrderDetail;