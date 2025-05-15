import React from 'react';
import { Order } from '@/services/order';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Clock, CheckCircle, AlertTriangle, DollarSign, ShoppingBag, Truck, X } from 'lucide-react';
import { StatusHistoryEntry } from '@/services/order';
import { PaymentTransaction } from '@/services/payment';

// Props for the OrderStatusTracker component
interface OrderStatusTrackerProps {
  order: Order;
}

// Get display name for an order status
const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'approved': 'Approved',
    'processing': 'Processing',
    'ready': 'Ready',
    'delivered': 'Delivered',
    'picked-up': 'Picked Up',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

// Get display name for a payment status
const getPaymentStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    'unpaid': 'Unpaid',
    'pending': 'Pending',
    'partial': 'Partially Paid',
    'paid': 'Paid',
    'refunded': 'Refunded'
  };
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

// Get icon for an order status
const getStatusIcon = (status: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'pending': <Clock className="h-5 w-5 text-yellow-500" />,
    'approved': <CheckCircle className="h-5 w-5 text-green-500" />,
    'processing': <ShoppingBag className="h-5 w-5 text-blue-500" />,
    'ready': <CheckCircle className="h-5 w-5 text-green-500" />,
    'delivered': <Truck className="h-5 w-5 text-green-500" />,
    'picked-up': <CheckCircle className="h-5 w-5 text-green-500" />,
    'completed': <CheckCircle className="h-5 w-5 text-green-500" />,
    'cancelled': <X className="h-5 w-5 text-red-500" />
  };
  
  return iconMap[status] || <Clock className="h-5 w-5 text-gray-500" />;
};

// Get icon for a payment status
const getPaymentStatusIcon = (status: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'unpaid': <AlertTriangle className="h-5 w-5 text-red-500" />,
    'pending': <Clock className="h-5 w-5 text-yellow-500" />,
    'partial': <DollarSign className="h-5 w-5 text-blue-500" />,
    'paid': <CheckCircle className="h-5 w-5 text-green-500" />,
    'refunded': <DollarSign className="h-5 w-5 text-purple-500" />
  };
  
  return iconMap[status] || <DollarSign className="h-5 w-5 text-gray-500" />;
};

// Get color for an order status
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'approved': 'bg-green-100 text-green-800 border-green-200',
    'processing': 'bg-blue-100 text-blue-800 border-blue-200',
    'ready': 'bg-green-100 text-green-800 border-green-200',
    'delivered': 'bg-green-100 text-green-800 border-green-200',
    'picked-up': 'bg-green-100 text-green-800 border-green-200',
    'completed': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Get color for a payment status
const getPaymentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'unpaid': 'bg-red-100 text-red-800 border-red-200',
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'partial': 'bg-blue-100 text-blue-800 border-blue-200',
    'paid': 'bg-green-100 text-green-800 border-green-200',
    'refunded': 'bg-purple-100 text-purple-800 border-purple-200'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Format payment method name for display
const getPaymentMethodName = (method: string): string => {
  const methodMap: Record<string, string> = {
    'credit-card': 'Credit Card',
    'cash': 'Cash',
    'cash-app': 'Cash App'
  };
  
  return methodMap[method] || method;
};

// Component to display the current order status
const CurrentStatus: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4">Current Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Status */}
        <div className={`p-4 rounded-lg border ${getStatusColor(order.status)}`}>
          <div className="flex items-center">
            {getStatusIcon(order.status)}
            <div className="ml-3">
              <h4 className="font-medium">Order Status</h4>
              <p>{getStatusDisplayName(order.status)}</p>
            </div>
          </div>
        </div>
        
        {/* Payment Status */}
        <div className={`p-4 rounded-lg border ${getPaymentStatusColor(order.paymentStatus)}`}>
          <div className="flex items-center">
            {getPaymentStatusIcon(order.paymentStatus)}
            <div className="ml-3">
              <h4 className="font-medium">Payment Status</h4>
              <p>{getPaymentStatusDisplayName(order.paymentStatus)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-start">
          <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
          <div className="ml-3">
            <h4 className="font-medium">Payment Summary</h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <p className="text-sm text-gray-600">Order Total:</p>
              <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
              
              <p className="text-sm text-gray-600">Amount Paid:</p>
              <p className="text-sm font-medium">{formatCurrency(order.amountPaid || 0)}</p>
              
              <p className="text-sm text-gray-600">Balance Due:</p>
              <p className="text-sm font-medium">{formatCurrency(order.balanceDue || order.total)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to display the status history timeline
const StatusTimeline: React.FC<{ entries: StatusHistoryEntry[] }> = ({ entries }) => {
  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort((a, b) => {
    // Parse string timestamps into Date objects for comparison
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="mb-6">
      <h3 className="lg font-medium mb-4">Status History</h3>

      <div className="space-y-4">
        {sortedEntries.map((entry, index) => {
          // Parse string timestamp to Date object for formatting
          const timestamp = new Date(entry.timestamp);

          return (
            <div key={index} className="flex">
              <div className="mr-4 flex-none">
                {getStatusIcon(entry.status)}
              </div>
              <div className="flex-grow pb-6">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                    {getStatusDisplayName(entry.status)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {formatDate(timestamp, { type: 'dateTime' })}
                  </span>
                </div>
                {entry.note && (
                  <p className="mt-1 text-sm text-gray-600">{entry.note}</p>
                )}
              </div>
            </div>
          );
        })}

        {sortedEntries.length === 0 && (
          <p className="text-sm text-gray-500">No status updates yet.</p>
        )}
      </div>
    </div>
  );
};

// Component to display payment history
const PaymentHistory: React.FC<{ payments: PaymentTransaction[] }> = ({ payments }) => {
  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort((a, b) => {
    // Parse string dates into Date objects for comparison
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
  
  return (
    <div className="mb-6">
      <h3 className="lg font-medium mb-4">Payment History</h3>
      
      {sortedPayments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Method</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Amount</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Confirmation</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedPayments.map((payment) => {
                // Parse string date into Date object for formatting
                const date = new Date(payment.date);
                
                // Determine if this is a refund (negative amount)
                const isRefund = payment.amount < 0;
                
                return (
                  <tr key={payment.id}>
                    <td className="px-4 py-3">{formatDate(date, { type: 'date' })}</td>
                    <td className="px-4 py-3">{getPaymentMethodName(payment.method)}</td>
                    <td className={`px-4 py-3 font-medium ${isRefund ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {payment.confirmationId || 'N/A'}
                      {payment.method === 'cash-app' && payment.cashAppDetails?.confirmationId && (
                        <span className="block text-xs text-gray-500">
                          ID: {payment.cashAppDetails.confirmationId}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{payment.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No payments recorded yet.</p>
      )}
    </div>
  );
};

// Main OrderStatusTracker component
const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ order }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">
          Order Status Tracking
        </h2>
      </div>
      
      <div className="p-6">
        {/* Current Status */}
        <CurrentStatus order={order} />
        
        {/* Status Timeline */}
        {order.statusHistory && (
          <StatusTimeline entries={order.statusHistory} />
        )}
        
        {/* Payment History */}
        {order.payments && order.payments.length > 0 && (
          <PaymentHistory payments={order.payments} />
        )}
      </div>
    </div>
  );
};

export default OrderStatusTracker;
