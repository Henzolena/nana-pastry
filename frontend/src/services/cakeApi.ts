import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import { Cake, CakeCategory, FrontendCreateCakeDto, FrontendUpdateCakeDto } from '../types';

const CAKES_ENDPOINT = '/cakes';

/**
 * Fetches all cakes, with optional filtering.
 * @param category - Filter by cake category.
 * @param featured - Filter by featured status.
 * @param bakerId - Filter by baker ID.
 * @param search - Search term for cake name or description.
 * @returns A promise that resolves to an array of Cake objects.
 */
export const getCakes = (
  category?: CakeCategory,
  featured?: boolean,
  bakerId?: string,
  search?: string
): Promise<Cake[]> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (featured !== undefined) params.append('featured', String(featured));
  if (bakerId) params.append('baker', bakerId);
  if (search) params.append('search', search);
  
  const queryString = params.toString();
  return apiGet<Cake[]>(`${CAKES_ENDPOINT}${queryString ? `?${queryString}` : ''}`);
};

/**
 * Fetches a single cake by its ID.
 * @param id - The ID of the cake to fetch.
 * @returns A promise that resolves to a Cake object.
 */
export const getCakeById = (id: string): Promise<Cake> => {
  return apiGet<Cake>(`${CAKES_ENDPOINT}/${id}`);
};

/**
 * Creates a new cake.
 * @param cakeData - The data for the new cake.
 * @returns A promise that resolves to the created Cake object.
 */
export const createCake = (cakeData: FrontendCreateCakeDto): Promise<Cake> => {
  return apiPost<Cake>(CAKES_ENDPOINT, cakeData);
};

/**
 * Updates an existing cake.
 * @param id - The ID of the cake to update.
 * @param cakeData - The data to update the cake with.
 * @returns A promise that resolves to the updated Cake object.
 */
export const updateCake = (id: string, cakeData: FrontendUpdateCakeDto): Promise<Cake> => {
  return apiPatch<Cake>(`${CAKES_ENDPOINT}/${id}`, cakeData);
};

/**
 * Deletes a cake by its ID.
 * @param id - The ID of the cake to delete.
 * @returns A promise that resolves when the cake is deleted.
 */
export const deleteCake = async (id: string): Promise<{ success: boolean; message: string }> => {
  // The backend returns { success: true, message: '...' }
  return apiDelete<{ success: boolean; message: string }>(`${CAKES_ENDPOINT}/${id}`);
};

/**
 * Toggles the featured status of a cake.
 * @param id - The ID of the cake.
 * @returns A promise that resolves to the updated Cake object.
 */
export const toggleCakeFeatured = (id: string): Promise<Cake> => {
  return apiPatch<Cake>(`${CAKES_ENDPOINT}/${id}/toggle-featured`, {});
};

/**
 * Toggles the availability status of a cake.
 * @param id - The ID of the cake.
 * @returns A promise that resolves to the updated Cake object.
 */
export const toggleCakeAvailability = (id: string): Promise<Cake> => {
  return apiPatch<Cake>(`${CAKES_ENDPOINT}/${id}/toggle-availability`, {});
};

/**
 * Fetches cakes by a specific baker ID.
 * @param bakerId - The ID of the baker.
 * @returns A promise that resolves to an array of Cake objects.
 */
export const getCakesByBakerId = (bakerId: string): Promise<Cake[]> => {
  return apiGet<Cake[]>(`${CAKES_ENDPOINT}/baker/${bakerId}`);
};
