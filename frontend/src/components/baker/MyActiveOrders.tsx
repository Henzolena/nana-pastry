import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus, StatusHistoryEntry } from '@/services/order';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Edit } from 'lucide-react';
import { apiGet, apiPut } from '@/services/apiService';
import { formatDate } from '@/utils/formatters';

const MyActiveOrders: React.FC = () => {
  const { user: bakerUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrders = async () => {
    if (!bakerUser) return;
    try {
      setLoading(true);
      // Query for baker active orders - need to add this endpoint in backend
      const activeOrders = await apiGet<Order[]>('/orders/baker/active');
      setOrders(activeOrders);
    } catch (error) {
      console.error("Error fetching active orders:", error);
      showErrorToast('Failed to fetch your active orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bakerUser) {
      fetchActiveOrders();
    }
  }, [bakerUser]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      showInfoToast(`Updating order ${orderId.substring(0,8)} to ${newStatus}...`);
      
      // Add a delay to allow the update to complete
      const updatePromise = apiPut<void>(`/orders/${orderId}/status`, { 
        status: newStatus,
        note: `Status updated to ${newStatus} by baker`
      });
      
      try {
        await updatePromise;
        showSuccessToast('Order status updated successfully!');
      } catch (apiError) {
        // Check if this is a JSON parsing error with status 200
        if (apiError instanceof SyntaxError && apiError.message.includes('JSON')) {
          // The server responded with success but no valid JSON - this is okay for void responses
          console.log('Server responded with success but empty body (expected for void response)');
          showSuccessToast('Order status updated successfully!');
        } else {
          // This is a real error
          throw apiError;
        }
      }
      
      // Optimistically update UI or re-fetch
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order.id === orderId) {
            // Create a properly typed status history entry
            const newHistoryEntry: StatusHistoryEntry = {
              status: newStatus as OrderStatus,
              timestamp: new Date().toISOString(),
              note: `Status updated to ${newStatus} by baker`
            };
            
            return {
              ...order,
              status: newStatus as OrderStatus,
              statusHistory: [
                ...(order.statusHistory || []),
                newHistoryEntry
              ]
            };
          }
          return order;
        });
        
        // Filter out completed/delivered/cancelled orders
        return updatedOrders.filter(order => 
          !['completed', 'delivered', 'cancelled'].includes(order.status)
        );
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      showErrorToast('Failed to update order status.');
      // Fetch the orders again to ensure UI is in sync with server
      fetchActiveOrders();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'claimed': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-indigo-100 text-indigo-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'delivered': return 'bg-teal-100 text-teal-700';
      case 'picked-up': return 'bg-teal-100 text-teal-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-warmgray-100 text-warmgray-700';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">My Active Orders</h2>
      {orders.length === 0 ? (
        <p className="text-warmgray-600 font-body text-center py-4">You have no active orders.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-warmgray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-heading text-hotpink font-semibold">Order #{order.id.substring(0, 8)}</h3>
                  <span className={`px-3 py-1 text-xs font-body font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-warmgray-600 font-body">
                  Customer: <strong className="text-deepbrown">{order.customerInfo.name}</strong>
                </p>
                <p className="text-xs text-warmgray-500 font-body mb-1">
                  {order.customerInfo.email}
                </p>
                <p className="text-sm text-warmgray-600 font-body">
                  Placed: {order.createdAt 
                      ? formatDate(order.createdAt, { 
                          type: 'dateTime', 
                          fallback: 'Date unavailable' 
                        })
                      : 'N/A'}
                </p>
                {order.deliveryMethod === 'delivery' && order.deliveryInfo?.deliveryDate && (
                  <p className="text-sm text-rosepink font-body font-semibold mt-1">
                    Due: {formatDate(order.deliveryInfo.deliveryDate, { 
                      type: 'dateTime', 
                      fallback: 'Date unavailable' 
                    })}
                  </p>
                )}
                {order.deliveryMethod === 'pickup' && order.pickupInfo?.pickupDate && (
                  <p className="text-sm text-rosepink font-body font-semibold mt-1">
                    Pickup: {formatDate(order.pickupInfo.pickupDate, { 
                      type: 'dateTime', 
                      fallback: 'Date unavailable' 
                    })}
                  </p>
                )}
                <div className="mt-3">
                  <p className="font-body text-sm font-medium text-deepbrown mb-1">Items:</p>
                  <ul className="list-disc list-inside pl-4 text-sm text-warmgray-700 font-body space-y-0.5">
                    {order.items.map((item, index) => (
                      <li key={index}>{item.name} (Qty: {item.quantity})</li>
                    ))}
                  </ul>
                </div>
                {order.specialInstructions && (
                  <div className="mt-2">
                    <p className="font-body text-sm font-medium text-deepbrown mb-0.5">Special Instructions:</p>
                    <p className="text-xs text-warmgray-600 font-body bg-warmgray-50 p-2 rounded">{order.specialInstructions}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-warmgray-200 flex justify-between items-center">
                <div className="flex-1">
                  <label htmlFor={`status-${order.id}`} className="block text-xs font-body font-medium text-deepbrown/90 mb-1">Update Status:</label>
                  <select
                    id={`status-${order.id}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="w-full p-2 border border-warmgray-300 rounded-md focus:ring-hotpink focus:border-hotpink font-body text-sm shadow-sm"
                  >
                    <option value="claimed">Claimed</option>
                    <option value="approved">Approved</option>
                    <option value="processing">Processing</option>
                    <option value="ready">Ready for Pickup/Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="picked-up">Picked Up</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <Link 
                  to={`/baker-portal/order/${order.id}`}
                  className="ml-2 p-2 bg-hotpink text-white rounded-md hover:bg-hotpink/90 flex items-center justify-center"
                  title="Manage Order"
                >
                  <Edit className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyActiveOrders;
