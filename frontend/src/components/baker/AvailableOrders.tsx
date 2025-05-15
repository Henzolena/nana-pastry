import React, { useEffect, useState } from 'react';
import { getUnclaimedOrders, Order, updateOrder } from '@/services/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

const AvailableOrders: React.FC = () => {
  const { user: bakerUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const unclaimedOrders = await getUnclaimedOrders();
      setOrders(unclaimedOrders);
    } catch (error) {
      console.error("Error fetching unclaimed orders:", error);
      showErrorToast('Failed to fetch available orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClaimOrder = async (orderId: string) => {
    if (!bakerUser) {
      showErrorToast('You must be logged in to claim orders.');
      return;
    }
    try {
      // Optimistically update UI or show loading state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      showInfoToast('Attempting to claim order...');

      await updateOrder(orderId, { bakerId: bakerUser.uid, status: 'claimed' });
      showSuccessToast(`Order ${orderId} claimed successfully!`);
      // fetchOrders(); // Re-fetch to ensure list is up-to-date, or navigate
    } catch (error) {
      console.error("Error claiming order:", error);
      showErrorToast('Failed to claim order. Please try again.');
      fetchOrders(); // Re-fetch to revert optimistic update if claim failed
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">Available Orders</h2>
      {orders.length === 0 ? (
        <p className="text-warmgray-600 font-body text-center py-4">No orders currently available for claiming.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-warmgray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-heading text-hotpink">Order ID: {order.id.substring(0, 8)}...</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-warmgray-600 mt-1">
                Placed on: {order.createdAt instanceof Timestamp ? order.createdAt.toDate().toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A')}
              </p>
              <div className="mt-2">
                <p className="font-body text-sm"><strong>Items:</strong> {order.items.length} item(s)</p>
                {/* Could show a summary of items if needed */}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleClaimOrder(order.id)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-hotpink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors"
                >
                  Claim Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOrders;
