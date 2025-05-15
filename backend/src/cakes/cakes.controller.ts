import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Query, 
  Request, 
  UnauthorizedException, 
  BadRequestException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { CakesService } from './cakes.service';
import { CreateCakeDto, CakeCategory } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { Cake } from './interfaces/cake.interface';

@Controller('cakes')
export class CakesController {
  constructor(private readonly cakesService: CakesService) {}

  // Create a new cake - accessible by bakers and admins
  @Post()
  @UseGuards(FirebaseAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() createCakeDto: CreateCakeDto, @Request() req): Promise<Cake> {
    // Check if user is a baker or admin
    if (req.user.role !== 'baker' && req.user.role !== 'admin') {
      throw new UnauthorizedException('Only bakers and admins can create cakes.');
    }

    // Assign bakerId if not provided
    if (!createCakeDto.bakerId) {
      createCakeDto.bakerId = req.user.uid;
    } else if (createCakeDto.bakerId !== req.user.uid && req.user.role !== 'admin') {
      // Only admins can create cakes for other bakers
      throw new UnauthorizedException('You can only create cakes for yourself.');
    }

    return this.cakesService.create(createCakeDto);
  }

  // Get all cakes - publicly accessible
  @Get()
  async findAll(
      @Query('category') category?: CakeCategory,
      @Query('featured') featured?: string,
      @Query('baker') bakerId?: string,
      @Query('search') search?: string
    ): Promise<Cake[]> {
    // Handle search separately
    if (search) {
      return this.cakesService.searchCakes(search);
    }
    
    // Convert string 'true'/'false' to boolean for featured
    const featuredBool = featured === undefined 
      ? undefined 
      : featured === 'true';
    
    return this.cakesService.findAll(category, featuredBool, bakerId);
  }

  // Get cakes by baker ID - publicly accessible
  @Get('baker/:bakerId')
  async findByBaker(@Param('bakerId') bakerId: string): Promise<Cake[]> {
    if (!bakerId) {
      throw new BadRequestException('Baker ID is required');
    }
    return this.cakesService.findByBakerId(bakerId);
  }

  // Get a specific cake - publicly accessible
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cake> {
    return this.cakesService.findOne(id);
  }

  // Update a cake - accessible by the baker who created it or an admin
  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string, 
    @Body() updateCakeDto: UpdateCakeDto,
    @Request() req
  ): Promise<Cake> {
    // First fetch the cake to check ownership
    const cake = await this.cakesService.findOne(id);
    
    // Check if user has permission to update
    if (cake.bakerId !== req.user.uid && req.user.role !== 'admin') {
      throw new UnauthorizedException('You can only update your own cakes.');
    }
    
    return this.cakesService.update(id, updateCakeDto);
  }

  // Delete a cake - accessible by the baker who created it or an admin
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async remove(@Param('id') id: string, @Request() req): Promise<{ success: boolean; message: string }> {
    // First fetch the cake to check ownership
    const cake = await this.cakesService.findOne(id);
    
    // Check if user has permission to delete
    if (cake.bakerId !== req.user.uid && req.user.role !== 'admin') {
      throw new UnauthorizedException('You can only delete your own cakes.');
    }
    
    await this.cakesService.remove(id);
    return { success: true, message: 'Cake successfully deleted' };
  }

  // Toggle featured status - admin only
  @Patch(':id/toggle-featured')
  @UseGuards(FirebaseAuthGuard)
  async toggleFeatured(@Param('id') id: string, @Request() req): Promise<Cake> {
    // Admin only operation
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only administrators can toggle featured status.');
    }
    
    return this.cakesService.toggleFeatured(id);
  }

  // Toggle availability - accessible by the baker who created it or an admin
  @Patch(':id/toggle-availability')
  @UseGuards(FirebaseAuthGuard)
  async toggleAvailability(@Param('id') id: string, @Request() req): Promise<Cake> {
    // First fetch the cake to check ownership
    const cake = await this.cakesService.findOne(id);
    
    // Check if user has permission to update
    if (cake.bakerId !== req.user.uid && req.user.role !== 'admin') {
      throw new UnauthorizedException('You can only update availability for your own cakes.');
    }
    
    return this.cakesService.toggleAvailability(id);
  }
}
