import React, { useState } from 'react';
import { Order, updateOrderStatus, OrderStatus, addOrderNote } from '@/services/order';
import { processCashAppPayment } from '@/services/payment';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CheckCircle, AlertTriangle, Clock, Edit, Save, X, MessageSquare } from 'lucide-react';

// Props for the OrderManagement component
interface OrderManagementProps {
  order: Order;
  onOrderUpdated: () => void;
}

// Order Management component for baker dashboard
const OrderManagement: React.FC<OrderManagementProps> = ({ order, onOrderUpdated }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status as OrderStatus);
  const [statusNote, setStatusNote] = useState('');
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(order.balanceDue?.toString() || order.total.toString());
  const [confirmationId, setConfirmationId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  
  // New state for baker notes
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Available order statuses
  const availableStatuses: OrderStatus[] = [
    'pending',
    'approved',
    'processing',
    'ready',
    'delivered',
    'picked-up',
    'completed',
    'cancelled'
  ];
  
  // Get display name for an order status
  const getStatusDisplayName = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'approved': 'Approved',
      'processing': 'Processing',
      'ready': 'Ready for Pickup/Delivery',
      'delivered': 'Delivered',
      'picked-up': 'Picked Up',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Get status badge color
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'processing': 'bg-blue-100 text-blue-800',
      'ready': 'bg-green-100 text-green-800',
      'delivered': 'bg-green-100 text-green-800',
      'picked-up': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };
  
  // Handle status update
  const handleStatusUpdate = async () => {
    setError(null);
    setSuccess(null);
    
    try {
      await updateOrderStatus(
        order.id,
        selectedStatus,
        statusNote || undefined
      );
      
      setIsUpdatingStatus(false);
      setStatusNote('');
      setSuccess(`Order status updated to ${getStatusDisplayName(selectedStatus)}`);
      
      // Notify parent component that the order was updated
      onOrderUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    }
  };
  
  // Handle processing Cash App payment
  const handleProcessPayment = async () => {
    setError(null);
    setSuccess(null);
    
    // Validate confirmation ID
    if (!confirmationId.trim()) {
      setError('Confirmation ID is required');
      return;
    }
    
    if (confirmationId.trim().length < 5) {
      setError('Confirmation ID should be at least 5 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9#-]*$/.test(confirmationId)) {
      setError('Confirmation ID contains invalid characters');
      return;
    }
    
    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid payment amount');
        return;
      }
      
      // Check if this confirmation ID has already been used
      const existingPayment = order.payments?.find((p) => 
        p.method === 'cash-app' && 
        p.cashAppDetails?.confirmationId?.toLowerCase() === confirmationId.toLowerCase()
      );
      
      if (existingPayment) {
        setError(`This confirmation ID (${confirmationId}) has already been recorded for this order. Please verify and enter a different ID.`);
        return;
      }
      
      await processCashAppPayment(
        order.id,
        amount,
        confirmationId,
        paymentNote || undefined
      );
      
      setIsProcessingPayment(false);
      setConfirmationId('');
      setPaymentNote('');
      setSuccess(`Payment of ${formatCurrency(amount)} recorded successfully`);
      
      // Notify parent component that the order was updated
      onOrderUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
    }
  };
  
  // Handle baker note addition
  const handleAddNote = async () => {
    setError(null);
    setSuccess(null);
    
    if (!newNote.trim()) {
      setError('Note cannot be empty');
      return;
    }
    
    try {
      await addOrderNote(order.id, newNote);
      
      setIsAddingNote(false);
      setNewNote('');
      setSuccess('Note added successfully');
      
      // Notify parent component that the order was updated
      onOrderUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to add note');
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">
          Order Management
        </h2>
      </div>
      
      <div className="p-6">
        {/* Alert messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-center text-left">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-md flex items-center text-left">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        
        {/* Order Summary */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Order ID</h3>
            <p className="font-medium">{order.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Order Date</h3>
            <p>
              {/* Handle potentially undefined createdAt and handle Timestamp objects */}
              {order.createdAt
                ? formatDate(
                    typeof order.createdAt === 'object' && 'toDate' in order.createdAt 
                      ? order.createdAt.toDate() 
                      : new Date(order.createdAt), 
                    { type: 'dateTime' }
                  )
                : 'N/A'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
            <p>{order.customerInfo.name}</p>
            <p className="text-sm text-gray-500">{order.customerInfo.email}</p>
            <p className="text-sm text-gray-500">{order.customerInfo.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Details</h3>
            <p className="font-medium">{formatCurrency(order.total)}</p>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium">Paid:</span> {formatCurrency(order.amountPaid || 0)}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Balance:</span> {formatCurrency(order.balanceDue || order.total)}
            </p>
          </div>
        </div>
        
        {/* Status Management */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Order Status</h3>
            
            {!isUpdatingStatus ? (
              <button
                onClick={() => setIsUpdatingStatus(true)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-1" />
                Update Status
              </button>
            ) : (
              <button
                onClick={() => setIsUpdatingStatus(false)}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            )}
          </div>
          
          {!isUpdatingStatus ? (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusDisplayName(order.status)}
              </span>
              <Clock className="h-4 w-4 text-gray-400 ml-2" />
              <span className="text-xs text-gray-500 ml-1">
                {order.statusHistory && order.statusHistory.length > 0 
                  ? `Last updated: ${formatDate(
                      // Parse string timestamp to Date object for formatting
                      new Date(order.statusHistory[order.statusHistory.length - 1].timestamp), 
                      { type: 'dateTime' }
                    )}`
                  : 'No status updates'
                }
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm"
                >
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusDisplayName(status)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Status Note (Optional)
                </label>
                <textarea
                  id="note"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note about this status update"
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleStatusUpdate}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-hotpink hover:bg-hotpink/90"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Status
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Payment Management (for Cash App) */}
        {order.paymentMethod === 'cash-app' && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Process Cash App Payment</h3>
              
              {!isProcessingPayment ? (
                <button
                  onClick={() => setIsProcessingPayment(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  disabled={order.balanceDue === 0}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Record Payment
                </button>
              ) : (
                <button
                  onClick={() => setIsProcessingPayment(false)}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              )}
            </div>
            
            {!isProcessingPayment ? (
              <div className="text-sm text-gray-500">
                {order.balanceDue === 0 ? (
                  <p className="text-green-600 font-medium">This order has been fully paid.</p>
                ) : (
                  <p>Balance due: {formatCurrency(order.balanceDue || order.total)}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      id="amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmationId" className="block text-sm font-medium text-gray-700 mb-1">
                    Cash App Confirmation ID
                  </label>
                  <input
                    type="text"
                    id="confirmationId"
                    value={confirmationId}
                    onChange={(e) => setConfirmationId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm font-mono tracking-wide"
                    placeholder="Enter Cash App confirmation ID (e.g., #C4R7B2L5)"
                    maxLength={30}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The confirmation ID can be found in the customer's Cash App receipt
                  </p>
                </div>
                
                <div>
                  <label htmlFor="paymentNote" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Note (Optional)
                  </label>
                  <textarea
                    id="paymentNote"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Add a note about this payment"
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleProcessPayment}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-hotpink hover:bg-hotpink/90"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Record Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Payment History Section */}
        {order.payments && order.payments.length > 0 && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.payments.map((payment, index) => (
                    <tr key={payment.id || index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.date, { type: 'dateTime', fallback: 'Date unavailable' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {payment.method}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {payment.method === 'cash-app' && payment.cashAppDetails?.confirmationId && (
                          <div className="font-mono text-xs bg-blue-50 p-1 rounded border border-blue-100 inline-block">
                            {payment.cashAppDetails.confirmationId}
                          </div>
                        )}
                        {payment.method === 'credit-card' && payment.cardDetails?.last4 && (
                          <span>
                            {payment.cardDetails.brand || 'Card'} ending in {payment.cardDetails.last4}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {payment.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Baker Notes Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Baker Notes</h3>
            
            {!isAddingNote ? (
              <button
                onClick={() => setIsAddingNote(true)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Add Note
              </button>
            ) : (
              <button
                onClick={() => setIsAddingNote(false)}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            )}
          </div>
          
          {!isAddingNote ? (
            <div className="space-y-2">
              {order.notes && order.notes.length > 0 ? (
                order.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-900">{note.content}</p>
                      <div className="text-xs text-gray-500">
                        {formatDate(note.timestamp, { type: 'dateTime', fallback: 'Date unavailable' })}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Added by: {note.bakerName}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No notes added for this order yet.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="newNote" className="block text-sm font-medium text-gray-700 mb-1">
                  New Baker Note
                </label>
                <textarea
                  id="newNote"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note for this order"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddNote}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-hotpink hover:bg-hotpink/90"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
