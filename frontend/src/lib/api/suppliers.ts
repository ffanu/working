import { Supplier } from '@/types/inventory';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const supplierApi = {
  // Get all suppliers
  getAll: async (params?: { search?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number }): Promise<{ data: Supplier[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const url = `${API_BASE_URL}/suppliers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch suppliers');
    }
    return response.json();
  },

  // Get supplier by ID
  getById: async (id: string): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch supplier');
    }
    return response.json();
  },

  // Create new supplier
  create: async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplier),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, response.statusText, errorText);
        throw new Error(`Failed to create supplier: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  // Update supplier
  update: async (id: string, supplier: Supplier): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplier),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, response.statusText, errorText);
        throw new Error(`Failed to update supplier: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  // Delete supplier
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete supplier');
    }
  },

  // Search suppliers
  search: async (query: string): Promise<Supplier[]> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search suppliers');
    }
    return response.json();
  },
}; 