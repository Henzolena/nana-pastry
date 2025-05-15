import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, UsePipes, ValidationPipe, UnauthorizedException, NotFoundException, BadRequestException, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, CancelOrderDto } from './dto/update-order-status.dto'; // Assuming CancelOrderDto will be added to this file or a new one
import { RecordPaymentDto } from './dto/record-payment.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { OrderStatus } from '../types/order.types'; // Assuming OrderStatus enum/type is defined here

@UseGuards(FirebaseAuthGuard) // Protect all routes in this controller
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req): Promise<{ id: string }> {
    return this.ordersService.createNewOrder(createOrderDto, { uid: req.user.uid });
  }

  @Get('my-orders') // Changed from /my-history
  async getMyOrderHistory(@Request() req): Promise<any[]> {
      return this.ordersService.getUserOrderHistory(req.user.uid, { uid: req.user.uid, role: req.user.role });
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string, @Request() req): Promise<any> {
    return this.ordersService.getOrder(orderId, { uid: req.user.uid, role: req.user.role });
  }

  @Put(':orderId/status')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Request() req
  ): Promise<void> {
    return this.ordersService.updateOrderStatus(orderId, updateStatusDto, { uid: req.user.uid, role: req.user.role });
  }

  @Put(':orderId/cancel')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Body() cancelOrderDto: CancelOrderDto, // New DTO
    @Request() req
  ): Promise<void> {
    // Authorization (e.g., only user who placed order or admin can cancel) should be handled in the service
    return this.ordersService.cancelOrder(orderId, cancelOrderDto.reason, { uid: req.user.uid, role: req.user.role });
  }

  @Post(':orderId/payments')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async recordPayment(
    @Param('orderId') orderId: string,
    @Body() recordPaymentDto: RecordPaymentDto,
    @Request() req
  ): Promise<{ paymentId: string }> {
    return this.ordersService.recordPayment(orderId, recordPaymentDto, { uid: req.user.uid, role: req.user.role });
  }

  @Post(':orderId/payments/cashapp')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async processCashAppPayment(
    @Param('orderId') orderId: string,
    @Body() body: { amount: number; confirmationId: string; notes?: string },
    @Request() req
  ): Promise<{ paymentId: string }> {
     const { amount, confirmationId, notes } = body;
     return this.ordersService.processCashAppPayment(orderId, amount, confirmationId, notes, { uid: req.user.uid, role: req.user.role });
  }

  // Endpoint to get all orders (Admin only), with optional status filtering
  @Get()
  async getAllOrders(@Request() req, @Query('status') status?: OrderStatus): Promise<any[]> {
     if (req.user.role !== 'admin') {
         throw new UnauthorizedException('Only administrators can view all orders.');
     }
    // Assuming ordersService.getAllOrdersForAdmin is updated to handle optional status filter
    return this.ordersService.getAllOrdersForAdmin(status, { uid: req.user.uid, role: req.user.role });
  }
}
