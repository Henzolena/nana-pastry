import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Clock, ArrowRight, CakeSlice, RefreshCw, AlertTriangle, AlertCircle, MapPin } from 'lucide-react';
import { getUserOrderHistory } from '@/services/order';
import type { Order } from '@/services/order';
import { formatCurrency, formatDate } from '@/utils/formatters';


export default function AccountOrders() {
  const { user,  } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);




  // Fetch orders with improved deduplication
  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    console.log('Fetching orders for user:', user.uid); // Keep logging user ID for context
    
    try {
      // Call the backend API via the refactored service, no userId needed here
      const ordersData = await getUserOrderHistory();
      console.log(`Raw orders received: ${ordersData.length}`);
      
      if (!ordersData || ordersData.length === 0) {
        console.log('No orders found for user');
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Advanced deduplication to handle existing duplicates
      
      // Step 1: Group orders by similarity (content-based)
      const similarOrderGroups: { [key: string]: Order[] } = {};
      
      for (const order of ordersData) {
        if (!order.id) continue;
        
        // Create a similarity key based on important order details
        // Orders with same items, quantities, and total are likely duplicates
        const contentKey = generateOrderContentKey(order);
        
        if (!similarOrderGroups[contentKey]) {
          similarOrderGroups[contentKey] = [];
        }
        
        similarOrderGroups[contentKey].push(order);
      }
      
      console.log(`Identified ${Object.keys(similarOrderGroups).length} unique order contents from ${ordersData.length} total orders`);
      
      // Step 2: For each group, keep the most complete order
      // If orders are from the same time period (within 60 minutes), keep only one
      const uniqueOrdersMap = new Map<string, Order>();
      
      for (const contentKey in similarOrderGroups) {
        const similarOrders = similarOrderGroups[contentKey];
        
        // Sort by creation time (newest first)
        similarOrders.sort((a, b) => {
          const timeA = getOrderTimestamp(a);
          const timeB = getOrderTimestamp(b);
          return timeB - timeA;
        });
        
        // Group by time windows (orders within 60 minutes of each other)
        const timeGroups: Order[][] = [];
        let currentGroup: Order[] = [similarOrders[0]];
        
        for (let i = 1; i < similarOrders.length; i++) {
          const prevOrder = similarOrders[i - 1];
          const currentOrder = similarOrders[i];
          
          const timeDiff = Math.abs(
            getOrderTimestamp(prevOrder) - getOrderTimestamp(currentOrder)
          );
          
          // If orders are created within 60 minutes of each other, consider them duplicates
          if (timeDiff <= 60 * 60 * 1000) {
            currentGroup.push(currentOrder);
          } else {
            timeGroups.push([...currentGroup]);
            currentGroup = [currentOrder];
          }
        }
        
        // Add the last group
        if (currentGroup.length > 0) {
          timeGroups.push(currentGroup);
        }
        
        // From each time group, select the most complete order
        for (const group of timeGroups) {
          const bestOrder = getBestOrder(group);
          uniqueOrdersMap.set(bestOrder.id!, bestOrder);
          
          // Log duplicate reduction
          if (group.length > 1) {
            console.log(`Reduced ${group.length} similar orders to 1 (keeping order ${bestOrder.id})`);
          }
        }
      }
      
      console.log(`Deduplication complete: ${ordersData.length} raw orders -> ${uniqueOrdersMap.size} unique orders`);
      
      // Convert Map to array and sort by creation date (newest first)
      const uniqueOrders = Array.from(uniqueOrdersMap.values()).sort((a, b) => {
        return getOrderTimestamp(b) - getOrderTimestamp(a);
      });
      
      console.log('Final deduplicated orders:', uniqueOrders.length);
      setOrders(uniqueOrders);
      
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      
      // Check if it contains a Firestore index creation URL (this might not be relevant anymore with API calls)
      // Keeping this check for now, but it might be removed later if backend handles all errors
      const errorMessage = err?.message || '';
      if (errorMessage.includes('index') && errorMessage.includes('https://console.firebase.google.com')) {
        const indexUrl = errorMessage.match(/(https:\/\/console\.firebase\.google\.com\S+)/)?.[1];
        if (indexUrl) {
          setIndexError(indexUrl);
        }
      }
      
      // Use the error message from the API if available
      const apiErrorMessage = err?.data?.message || err?.message || 'Failed to load your orders. Please try again later.';
      setError(apiErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Helper function to generate a content-based key for similarity checking
  const generateOrderContentKey = (order: Order): string => {
    // Create a key based on important order details
    const itemsKey = order.items
      ?.map((item: { cakeId: any; name: any; quantity: any; price: any; }) => `${item.cakeId || ''}:${item.name}:${item.quantity}:${item.price}`)
      .sort()
      .join('|') || '';
      
    const totalKey = `${order.total || 0}`;
    const statusKey = order.status || '';
    
    return `${itemsKey}#${totalKey}#${statusKey}`;
  };
  
  // Helper function to get timestamp from order (now handles string timestamps)
  const getOrderTimestamp = (order: Order): number => {
    if (!order.createdAt) return 0;
    
    try {
      // Assuming createdAt is now a string timestamp from the backend
      const date = new Date(order.createdAt);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    } catch (e) {
      console.error('Error parsing timestamp string:', e);
    }
    
    return 0;
  };
  
  // Helper function to get the most complete order from a group
  const getBestOrder = (orders: Order[]): Order => {
    return orders.reduce((best, current) => {
      const bestScore = getOrderCompletenessScore(best);
      const currentScore = getOrderCompletenessScore(current);
      
      return currentScore > bestScore ? current : best;
    }, orders[0]);
  };
  
  // Helper function to score order completeness
  const getOrderCompletenessScore = (order: Order): number => {
    let score = 0;
    if (order.status === 'completed') score += 10;
    if (order.status === 'processing') score += 5;
    if (order.status === 'confirmed' as any) score += 3;
    
    // Score based on fields presence
    if (order.items?.length) score += order.items.length;
    if (order.total) score += 1;
    // Updated property access from totals?.total to total
    if (order.total) score += 1; 
    // Updated property access from payment?.status to paymentStatus
    if (order.paymentStatus) score += 1; 
    if (order.createdAt) score += 1;
    
    return score;
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefreshOrders = async () => {
    if (!user || refreshing) return;
    
    try {
      setRefreshing(true);
      setIndexError(null);
      // Call the backend API via the refactored service, no userId needed here
      const userOrders = await getUserOrderHistory();
      
      // Deduplicate orders using a Map with order ID as key
      const uniqueOrders = new Map<string, Order>();
      
      // Process each order and only keep the latest version of each order ID
      userOrders.forEach(order => {
        if (order && order.id) {
          // If we already have this order ID, only replace it if this one is newer
          const existingOrder = uniqueOrders.get(order.id);
          
          // Compare using Date objects parsed from the string timestamps
          const orderUpdatedAt = order.updatedAt ? new Date(order.updatedAt) : null;
          const existingUpdatedAt = existingOrder?.updatedAt ? new Date(existingOrder.updatedAt) : null;

          if (!existingOrder || 
              (orderUpdatedAt && existingUpdatedAt && 
               orderUpdatedAt.getTime() > existingUpdatedAt.getTime())) {
            uniqueOrders.set(order.id, order);
          }
        }
      });
      
      // Convert Map back to array and sort by createdAt (newest first)
      const dedupedOrders = Array.from(uniqueOrders.values())
        .sort((a, b) => {
          // Compare using Date objects parsed from the string timestamps
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      
      console.log(`Found ${userOrders.length} orders, deduplicated to ${dedupedOrders.length}`);
      setOrders(dedupedOrders);
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing orders:', err);
      
      // Check if it contains a Firestore index creation URL (this might not be relevant anymore with API calls)
      // Keeping this check for now, but it might be removed later if backend handles all errors
      const errorMessage = err?.message || '';
      if (errorMessage.includes('index') && errorMessage.includes('https://console.firebase.google.com')) {
        const indexUrl = errorMessage.match(/(https:\/\/console\.firebase\.google\.com\S+)/)?.[1];
        if (indexUrl) {
          setIndexError(indexUrl);
        }
      }
      
      // Use the error message from the API if available
      const apiErrorMessage = err?.data?.message || err?.message || 'Failed to refresh order history. Please try again.';
      setError(apiErrorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper to safely format dates with additional logging
  const safeFormatDate = (order: any, path: string): string => {
    const segments = path.split('.');
    let value = order;
    
    for (const segment of segments) {
      if (!value || typeof value !== 'object') {
        console.debug(`[DateFormat] Missing segment ${segment} in path ${path} for order ${order?.id}`);
        return 'N/A';
      }
      value = value[segment];
    }
    
    if (!value) {
      console.debug(`[DateFormat] Null/undefined value for ${path} in order ${order?.id}`);
      return 'N/A';
    }
    
    // Assuming value is now a string timestamp from the backend
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? 'Invalid Date' : formatDate(date, { type: 'dateTimeShort' });
    } catch (e) {
      console.error(`[DateFormat] Error formatting date string for ${path}:`, e);
      return 'Invalid Date';
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

  // Placeholder for empty state
  if (!loading && orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
        <a 
          href="/products" 
          className="inline-flex items-center bg-hotpink hover:bg-hotpink/90 text-white py-2 px-4 rounded transition"
        >
          <CakeSlice className="w-5 h-5 mr-2" />
          Browse Our Cakes
        </a>
      </div>
    );
  }

  return (
    <div>
      {indexError && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Administrator Action Required</p>
            <p className="text-sm mb-2">
              This query requires a Firestore index to be created for optimal performance. 
              The orders are being displayed using a fallback method.
            </p>
            <a 
              href={indexError}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
            >
              Create Index in Firebase Console
            </a>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <AlertTriangle className="h-5 w-5 inline-block mr-2" />
          {error}
          <button 
            onClick={handleRefreshOrders}
            className="ml-4 text-red-700 hover:text-red-900 underline flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Try Again
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-deepbrown">Your Order History</h2>
        <button 
          onClick={handleRefreshOrders}
          disabled={refreshing}
          className="flex items-center text-sm text-gray-600 hover:text-hotpink transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotpink"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm md:text-base space-y-1">
                    <div className="font-medium">
                      Order #{order.id?.substring(0, 8) || 'N/A'}
                    </div>
                    <div className="text-muted-foreground text-xs md:text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {/* Use safeFormatDate for createdAt */}
                      {safeFormatDate(order, 'createdAt')}
                    </div>
                    
                    {/* Display Delivery Info (updated path) */}
                    {order.deliveryMethod === 'delivery' && order.deliveryInfo && (
                      <div className="text-muted-foreground text-xs md:text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Delivery: {safeFormatDate(order, 'deliveryInfo.deliveryDate')}
                        {order.deliveryInfo?.deliveryTime && ` (${order.deliveryInfo.deliveryTime})`}
                      </div>
                    )}
                    
                    {/* Display Pickup Info (updated path) */}
                    {order.deliveryMethod === 'pickup' && order.pickupInfo && (
                      <div className="text-muted-foreground text-xs md:text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Pickup: {safeFormatDate(order, 'pickupInfo.pickupDate')}
                        {order.pickupInfo?.pickupTime && ` (${order.pickupInfo.pickupTime})`}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusBadgeClass(order.status)
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Items</h4>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <span>
                        {item.quantity}x {item.name}
                        {item.customizations?.size && (
                          <span className="text-gray-500 ml-1">({item.customizations.size})</span>
                        )}
                      </span>
                      <span className="font-medium">{formatCurrency(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span>Total Amount:</span>
                <span className="font-semibold">{formatCurrency(order.total)}</span>
              </div>
              
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <div className="flex flex-col text-gray-500 text-sm mt-2">
                  <div className="flex items-center mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                  </div>
                  
                  {order.deliveryMethod === 'delivery' ? (
                    <div className="mt-2">
                      <div className="font-medium">Delivery Information</div>
                      <div className="text-sm">
                        Delivery Date: {safeFormatDate(order, 'deliveryInfo.deliveryDate')}
                        {order.deliveryInfo?.deliveryTime && ` (${order.deliveryInfo.deliveryTime})`}
                      </div>
                      {order.deliveryInfo?.address && (
                        <div className="text-sm">
                          Address: {order.deliveryInfo.address}, {order.deliveryInfo.city}, 
                          {order.deliveryInfo.state} {order.deliveryInfo.zipCode}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="font-medium">Pickup Information</div>
                      <div className="text-sm">
                        Pickup Date: {safeFormatDate(order, 'pickupInfo.pickupDate')}
                        {order.pickupInfo?.pickupTime && ` (${order.pickupInfo.pickupTime})`}
                      </div>
                      <div className="text-sm">
                        Location: {order.pickupInfo?.storeLocation || 'Main Store'}
                      </div>
                    </div>
                  )}
                </div>
                
                <a href={`/orders/${order.id}`} className="inline-flex items-center text-sm text-hotpink hover:text-hotpink/80 transition-colors">
                  View Details <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
