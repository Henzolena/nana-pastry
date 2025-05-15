# Baker API Documentation

This document outlines the backend API endpoints available for bakers in the Nana Pastry application.

## Authentication

All baker endpoints require authentication with a valid Firebase JWT token.
The user making the request must have the baker role assigned in their Firebase Authentication claims.

## Available Endpoints

### Get Unclaimed Orders

Retrieves orders that haven't been claimed by any baker yet.

```
GET /orders/unclaimed
```

#### Response
```json
[
  {
    "id": "order123",
    "userId": "customer456",
    "status": "pending",
    "items": [...],
    "customerInfo": {...},
    ...
  }
]
```

### Claim an Order

Allows a baker to claim an order to work on it.

```
PUT /orders/:orderId/claim
```

#### Response
```json
{
  "id": "order123",
  "bakerId": "baker789",
  "status": "claimed",
  "items": [...],
  ...
}
```

### Get Baker's Active Orders

Retrieves orders currently assigned to the baker.

```
GET /orders/baker/active
```

#### Response
```json
[
  {
    "id": "order123",
    "bakerId": "baker789", 
    "status": "processing",
    "items": [...],
    ...
  }
]
```

### Get Baker's Order History

Retrieves completed or cancelled orders that were assigned to the baker.

```
GET /orders/baker/history
```

#### Response
```json
[
  {
    "id": "order123",
    "bakerId": "baker789", 
    "status": "completed",
    "items": [...],
    ...
  }
]
```

### Update Order Status

Updates the status of an order assigned to the baker.

```
PUT /orders/:orderId/status
```

#### Request Body
```json
{
  "status": "processing", 
  "note": "Starting to work on this order"
}
```

#### Response
Returns 200 OK if successful.

## Order Notes

### Add Note to Order

Adds a baker note to an order.

```
POST /orders/:orderId/notes
```

#### Request Body
```json
{
  "content": "Customer called to confirm the cake flavor will be chocolate."
}
```

#### Response
Returns 200 OK if successful.

## Order Status Flow

Orders typically follow this status progression:
1. `pending` - Initial status when order is placed by customer
2. `claimed` - Baker has claimed the order
3. `approved` - Order has been approved by the baker
4. `processing` - Baker is working on the order
5. `ready` - Order is ready for pickup/delivery
6. `delivered` - Order has been delivered (if delivery method is 'delivery')
7. `picked-up` - Order has been picked up (if delivery method is 'pickup')
8. `completed` - Order is complete
9. `cancelled` - Order has been cancelled

Bakers can only claim orders with 'pending' status, and they can only update orders that are already assigned to them.
