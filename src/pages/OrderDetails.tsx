import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder } from '../services/order'; // Ensure this is the correct import path
import type { Order } from '../services/order';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          throw new Error('Order ID is missing');
        }
        const fetchedOrder = await getOrder(orderId);
        setOrder(fetchedOrder);
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Order Details</h1>
      {order ? (
        <div>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
          <p><strong>Customer:</strong> {order.customerInfo.name}</p>
          <p><strong>Delivery Method:</strong> {order.deliveryMethod}</p>
          {/* Add more fields as needed */}
        </div>
      ) : (
        <p>Order not found</p>
      )}
    </div>
  );
};

export default OrderDetails;
