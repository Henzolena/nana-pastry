import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBakerActiveOrders, Order, updateOrder } from '@/services/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import { Edit } from 'lucide-react';

const MyActiveOrders: React.FC = () => {
  const { user: bakerUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrders = async () => {
    if (!bakerUser) return;
    try {
      setLoading(true);
      const activeOrders = await getBakerActiveOrders(bakerUser.uid);
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
      await updateOrder(orderId, { status: newStatus });
      showSuccessToast('Order status updated successfully!');
      // Optimistically update UI or re-fetch
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ).filter(order => newStatus !== 'completed' && newStatus !== 'delivered' && newStatus !== 'cancelled') // Remove if moved to non-active
      );
      // Or call fetchActiveOrders(); if complex filtering is involved
    } catch (error) {
      console.error("Error updating order status:", error);
      showErrorToast('Failed to update order status.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'claimed': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-indigo-100 text-indigo-700';
      case 'baking': return 'bg-purple-100 text-purple-700';
      case 'decorating': return 'bg-pink-100 text-pink-700'; // Using a theme color
      case 'ready for pickup': return 'bg-green-100 text-green-700';
      case 'out for delivery': return 'bg-teal-100 text-teal-700';
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
                  Placed: {order.createdAt instanceof Timestamp ? order.createdAt.toDate().toLocaleString() : (order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A')}
                </p>
                {order.deliveryMethod === 'delivery' && order.deliveryInfo?.deliveryDate && (
                  <p className="text-sm text-rosepink font-body font-semibold mt-1">
                    Due: {order.deliveryInfo.deliveryDate instanceof Timestamp ? order.deliveryInfo.deliveryDate.toDate().toLocaleString() : new Date(order.deliveryInfo.deliveryDate).toLocaleString()}
                  </p>
                )}
                {order.deliveryMethod === 'pickup' && order.pickupInfo?.pickupDate && (
                  <p className="text-sm text-rosepink font-body font-semibold mt-1">
                    Pickup: {order.pickupInfo.pickupDate instanceof Timestamp ? order.pickupInfo.pickupDate.toDate().toLocaleString() : new Date(order.pickupInfo.pickupDate).toLocaleString()}
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
                    <option value="claimed">Claimed (To Do)</option>
                    <option value="in-progress">In Progress</option>
                    <option value="baking">Baking</option>
                    <option value="decorating">Decorating</option>
                    <option value="ready for pickup">Ready for Pickup</option>
                    <option value="out for delivery">Out for Delivery</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option> {/* Added Cancelled */}
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
