export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'picked-up'
  | 'completed'
  | 'cancelled';

// Add other shared order-related types or enums here if needed in the future.
// For example, PaymentStatus, DeliveryMethod, etc.

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'partial'
  | 'paid'
  | 'refunded';

export type DeliveryMethod = 'pickup' | 'delivery';
