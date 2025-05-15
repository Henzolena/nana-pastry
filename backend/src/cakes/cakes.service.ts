import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { firebaseAdmin } from '../firebase-admin.config';
import { firestore } from 'firebase-admin'; // Import firestore namespace
import { CreateCakeDto, CakeCategory } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';
import { Cake } from './interfaces/cake.interface';

@Injectable()
export class CakesService {
  private readonly cakesCollection = 'cakes';
  private firestore = firebaseAdmin.firestore();

  // Helper to convert Firestore Timestamp to Date
  private convertTimestampToDate(timestamp: any): Date | null {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return null;
  }

  /**
   * Create a new cake
   */
  async create(createCakeDto: CreateCakeDto): Promise<Cake> {
    try {
      // Prepare cake data with timestamps
      const newCake = {
        ...createCakeDto,
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        isAvailable: createCakeDto.isAvailable ?? true,
        featured: createCakeDto.featured ?? false,
      };

      // Add to Firestore
      const docRef = await this.firestore.collection(this.cakesCollection).add(newCake);
      
      // Get the created document
      const cakeSnapshot = await docRef.get();
      const cakeData = cakeSnapshot.data() as Omit<Cake, 'id'>; // Firestore returns Timestamps
      
      // Return with id
      return { 
        id: docRef.id,
        ...cakeData,
        // Convert Timestamps to Dates for the response
        createdAt: this.convertTimestampToDate(cakeData.createdAt) || new Date(), // Fallback to new Date if null
        updatedAt: this.convertTimestampToDate(cakeData.updatedAt) || new Date(), // Fallback to new Date if null
      } as Cake;
    } catch (error) {
      console.error('Error creating cake:', error);
      throw new InternalServerErrorException('Failed to create cake');
    }
  }

  /**
   * Get all cakes with optional filtering
   */
  async findAll(
    category?: CakeCategory, 
    featuredOnly?: boolean, 
    bakerId?: string
  ): Promise<Cake[]> {
    try {
      let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = 
        this.firestore.collection(this.cakesCollection);

      // Apply filters if provided
      if (category) {
        query = query.where('category', '==', category);
      }

      if (featuredOnly) {
        query = query.where('featured', '==', true);
      }

      if (bakerId) {
        query = query.where('bakerId', '==', bakerId);
      }
      
      // Get sorted results
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      
      // Map results to Cake objects
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestampToDate(data.createdAt),
          updatedAt: this.convertTimestampToDate(data.updatedAt),
        } as Cake;
      });
    } catch (error) {
      console.error('Error finding cakes:', error);
      throw new InternalServerErrorException('Failed to fetch cakes');
    }
  }

  /**
   * Get a single cake by ID
   */
  async findOne(id: string): Promise<Cake> {
    try {
      const cakeDoc = await this.firestore.collection(this.cakesCollection).doc(id).get();
      
      if (!cakeDoc.exists) {
        throw new NotFoundException(`Cake with ID ${id} not found`);
      }
      
      const cakeData = cakeDoc.data();
      return {
        id: cakeDoc.id,
        ...cakeData,
        createdAt: this.convertTimestampToDate(cakeData?.createdAt),
        updatedAt: this.convertTimestampToDate(cakeData?.updatedAt),
      } as Cake;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding cake:', error);
      throw new InternalServerErrorException('Failed to fetch cake');
    }
  }

  /**
   * Update a cake
   */
  async update(id: string, updateCakeDto: UpdateCakeDto): Promise<Cake> {
    try {
      const cakeRef = this.firestore.collection(this.cakesCollection).doc(id);
      const cakeDoc = await cakeRef.get();
      
      if (!cakeDoc.exists) {
        throw new NotFoundException(`Cake with ID ${id} not found`);
      }
      
      // Prepare update data
      const updateData = {
        ...updateCakeDto,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      };
      
      // Update the document
      await cakeRef.update(updateData);
      
      // Get the updated document
      const updatedDoc = await cakeRef.get();
      const updatedData = updatedDoc.data();
      
      return {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: this.convertTimestampToDate(updatedData?.createdAt),
        updatedAt: this.convertTimestampToDate(updatedData?.updatedAt),
      } as Cake;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating cake:', error);
      throw new InternalServerErrorException('Failed to update cake');
    }
  }

  /**
   * Delete a cake
   */
  async remove(id: string): Promise<void> {
    try {
      const cakeRef = this.firestore.collection(this.cakesCollection).doc(id);
      const cakeDoc = await cakeRef.get();
      
      if (!cakeDoc.exists) {
        throw new NotFoundException(`Cake with ID ${id} not found`);
      }
      
      await cakeRef.delete();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting cake:', error);
      throw new InternalServerErrorException('Failed to delete cake');
    }
  }

  /**
   * Toggle the featured status of a cake
   */
  async toggleFeatured(id: string): Promise<Cake> {
    try {
      const cakeRef = this.firestore.collection(this.cakesCollection).doc(id);
      const cakeDoc = await cakeRef.get();
      
      if (!cakeDoc.exists) {
        throw new NotFoundException(`Cake with ID ${id} not found`);
      }
      
      const cakeData = cakeDoc.data() as Cake;
      const newFeaturedStatus = !cakeData.featured;
      
      await cakeRef.update({ 
        featured: newFeaturedStatus,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      });
      
      // Get the updated document
      const updatedDoc = await cakeRef.get();
      const updatedData = updatedDoc.data();
      
      return {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: this.convertTimestampToDate(updatedData?.createdAt),
        updatedAt: this.convertTimestampToDate(updatedData?.updatedAt),
      } as Cake;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error toggling featured status:', error);
      throw new InternalServerErrorException('Failed to toggle featured status');
    }
  }

  /**
   * Toggle the availability of a cake
   */
  async toggleAvailability(id: string): Promise<Cake> {
    try {
      const cakeRef = this.firestore.collection(this.cakesCollection).doc(id);
      const cakeDoc = await cakeRef.get();
      
      if (!cakeDoc.exists) {
        throw new NotFoundException(`Cake with ID ${id} not found`);
      }
      
      const cakeData = cakeDoc.data() as Cake;
      const newAvailabilityStatus = !cakeData.isAvailable;
      
      await cakeRef.update({ 
        isAvailable: newAvailabilityStatus,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      });
      
      // Get the updated document
      const updatedDoc = await cakeRef.get();
      const updatedData = updatedDoc.data();
      
      return {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: this.convertTimestampToDate(updatedData?.createdAt),
        updatedAt: this.convertTimestampToDate(updatedData?.updatedAt),
      } as Cake;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error toggling availability:', error);
      throw new InternalServerErrorException('Failed to toggle availability');
    }
  }

  /**
   * Get cakes by baker ID
   */
  async findByBakerId(bakerId: string): Promise<Cake[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.cakesCollection)
        .where('bakerId', '==', bakerId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestampToDate(data.createdAt),
          updatedAt: this.convertTimestampToDate(data.updatedAt),
        } as Cake;
      });
    } catch (error) {
      console.error(`Error finding cakes for baker ${bakerId}:`, error);
      throw new InternalServerErrorException('Failed to fetch baker cakes');
    }
  }

  /**
   * Search cakes by name or description
   */
  async searchCakes(query: string): Promise<Cake[]> {
    try {
      // Firestore doesn't support native text search, so we'll fetch all and filter
      // For a production app, consider using Algolia, Elasticsearch, or Firebase's full-text extension
      const snapshot = await this.firestore
        .collection(this.cakesCollection)
        .get();
      
      const searchTerms = query.toLowerCase().split(' ');
      
      return snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: this.convertTimestampToDate(data.createdAt),
            updatedAt: this.convertTimestampToDate(data.updatedAt),
          } as Cake;
        })
        .filter(cake => {
          // Check if any search term is included in name or description
          return searchTerms.some(term => 
            cake.name.toLowerCase().includes(term) || 
            cake.description.toLowerCase().includes(term)
          );
        });
    } catch (error) {
      console.error('Error searching cakes:', error);
      throw new InternalServerErrorException('Failed to search cakes');
    }
  }
}
