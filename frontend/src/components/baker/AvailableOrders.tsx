import React, { useEffect, useState } from 'react';
import { Order } from '@/services/order';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPut } from '@/services/apiService';
import { Search, FilterX, Calendar } from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/formatters';

const AvailableOrders: React.FC = () => {
  const { user: bakerUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching unclaimed orders with endpoint: /orders/unclaimed");
      // Use the correct endpoint for unclaimed orders
      const unclaimedOrders = await apiGet<Order[]>('/orders/unclaimed');
      console.log("Successfully retrieved unclaimed orders:", unclaimedOrders.length);
      setOrders(unclaimedOrders);
      setFilteredOrders(unclaimedOrders);
    } catch (error) {
      console.error("Error fetching unclaimed orders:", error);
      showErrorToast('Failed to fetch available orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bakerUser) {
      fetchOrders();
    }
  }, [bakerUser]);

  useEffect(() => {
    // Apply filters when search term or dates change
    let result = orders;

    // Filter by search term (customer name, order ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) || 
        order.customerInfo?.name?.toLowerCase().includes(term) ||
        order.items.some(item => item.name?.toLowerCase().includes(term))
      );
    }

    // Filter by date range
    if (startDate) {
      const start = parseISO(startDate);
      result = result.filter(order => 
        order.createdAt && isAfter(
          typeof order.createdAt.toDate === 'function' 
            ? order.createdAt.toDate() 
            : new Date(order.createdAt as string), 
          start
        )
      );
    }

    if (endDate) {
      const end = parseISO(endDate);
      result = result.filter(order => 
        order.createdAt && isBefore(
          typeof order.createdAt.toDate === 'function' 
            ? order.createdAt.toDate() 
            : new Date(order.createdAt as string), 
          end
        )
      );
    }

    setFilteredOrders(result);
  }, [searchTerm, startDate, endDate, orders]);

  const handleClaimOrder = async (orderId: string) => {
    if (!bakerUser) {
      showErrorToast('You must be logged in to claim orders.');
      return;
    }
    try {
      // Optimistically update UI or show loading state
      setFilteredOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      showInfoToast('Attempting to claim order...');

      await apiPut<Order>(`/orders/${orderId}/claim`, {});
      
      showSuccessToast(`Order claimed successfully!`);
      // Navigate to the claimed order details page
      navigate(`/baker-portal/order/${orderId}`);
    } catch (error) {
      console.error("Error claiming order:", error);
      showErrorToast('Failed to claim order. Please try again.');
      fetchOrders(); // Re-fetch to revert optimistic update if claim failed
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setFilteredOrders(orders);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">Available Orders</h2>
      
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-warmgray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, order ID, or items..."
              className="pl-10 w-full p-2.5 border border-warmgray-300 rounded-md font-body text-sm focus:ring-hotpink focus:border-hotpink"
            />
          </div>
          
          {/* Date filter controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-warmgray-400 mr-1" />
                <label htmlFor="start-date" className="block text-xs font-body text-warmgray-600 mr-2">From:</label>
              </div>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-warmgray-300 rounded-md font-body text-sm focus:ring-hotpink focus:border-hotpink"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-warmgray-400 mr-1" />
                <label htmlFor="end-date" className="block text-xs font-body text-warmgray-600 mr-2">To:</label>
              </div>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-warmgray-300 rounded-md font-body text-sm focus:ring-hotpink focus:border-hotpink"
              />
            </div>
          </div>
          
          {/* Reset filters button */}
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-warmgray-700 bg-warmgray-100 rounded-md hover:bg-warmgray-200 focus:ring-2 focus:ring-warmgray-300 self-end"
            title="Reset filters"
          >
            <FilterX className="h-4 w-4 mr-1" />
            Reset
          </button>
        </div>
        
        {/* Results count */}
        <div className="text-sm text-warmgray-600">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <p className="text-warmgray-600 font-body text-center py-4">No orders currently available for claiming.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
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
                Placed on: {formatDate(order.createdAt, { 
                  type: 'dateTime', 
                  fallback: 'Date unavailable' 
                })}
              </p>
              <div className="mt-2">
                <p className="font-body text-sm mb-1"><strong>Customer:</strong> {order.customerInfo.name}</p>
                <p className="font-body text-sm"><strong>Items:</strong> {order.items.length} item(s)</p>
                <ul className="list-disc list-inside pl-2 text-xs text-warmgray-600 font-body">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <li key={idx}>{item.name} (Qty: {item.quantity})</li>
                  ))}
                  {order.items.length > 3 && <li>...{order.items.length - 3} more item(s)</li>}
                </ul>
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
