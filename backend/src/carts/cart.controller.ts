import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@ApiTags('carts')
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  async getCurrentCart(@Req() req) {
    return this.cartService.getUserCart(req.user.uid);
  }

  @Put('current')
  @ApiOperation({ summary: 'Save/update the entire cart' })
  @ApiResponse({ status: 200, description: 'Cart saved successfully' })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  async saveCart(@Req() req, @Body() cartData) {
    return this.cartService.saveCart(req.user.uid, cartData);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  async addItem(@Req() req, @Body() createCartItemDto: CreateCartItemDto) {
    return this.cartService.addItem(req.user.uid, createCartItemDto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  async updateItem(
    @Req() req,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.uid, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  async removeItem(@Req() req, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(req.user.uid, itemId);
  }

  @Delete('current')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.uid);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart with user cart' })
  @ApiResponse({ status: 200, description: 'Carts merged successfully' })
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  async mergeGuestCart(@Req() req, @Body() mergeCartDto: MergeCartDto) {
    return this.cartService.mergeGuestCart(req.user.uid, mergeCartDto.guestCart);
  }
}
