import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '@/services/order';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye } from 'lucide-react';
import { apiGet } from '@/services/apiService';
import { formatDate } from '@/utils/formatters';

const OrderHistory: React.FC = () => {
  const { user: bakerUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bakerUser) {
      const fetchOrderHistory = async () => {
        try {
          setLoading(true);
          const historyOrders = await apiGet<Order[]>('/orders/baker/history');
          setOrders(historyOrders);
        } catch (error) {
          console.error("Error fetching order history:", error);
          showErrorToast('Failed to fetch your order history.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrderHistory();
    }
  }, [bakerUser]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'delivered': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-warmgray-100 text-warmgray-700';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">My Order History</h2>
      {orders.length === 0 ? (
        <p className="text-warmgray-600 font-body text-center py-4">You have no past orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-warmgray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-heading text-hotpink font-semibold">Order #{order.id.substring(0, 8)}</h3>
                <span className={`px-3 py-1 text-xs font-body font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-warmgray-600 font-body">
                Customer: <strong className="text-deepbrown">{order.customerInfo.name}</strong>
              </p>
              <p className="text-sm text-warmgray-600 font-body">
                Placed: {formatDate(order.createdAt, { type: 'dateTime', fallback: 'Date unavailable' })}
              </p>
              {order.updatedAt && (
                 <p className="text-xs text-warmgray-500 font-body">
                   Last Updated: {formatDate(order.updatedAt, { type: 'dateTime', fallback: 'Date unavailable' })}
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
              <div className="mt-4 pt-4 border-t border-warmgray-200 flex justify-end">
                <Link 
                  to={`/baker-portal/order/${order.id}`}
                  className="px-3 py-1 bg-deepbrown text-white rounded-md hover:bg-deepbrown/90 flex items-center text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
