import { Batch } from '@/types/inventory';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const batchesApi = {
  // Get all batches with pagination and search
  getAll: async (params?: {
    search?: string;
    sortBy?: string;
    sortDir?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/batches?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch batches');
    }
    return response.json();
  },

  // Get batch by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/batches/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch batch');
    }
    return response.json();
  },

  // Get batches by product ID
  getByProduct: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/batches/product/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch batches');
    }
    return response.json();
  },

  // Get batches expiring soon
  getExpiringSoon: async (days: number = 30) => {
    const response = await fetch(`${API_BASE_URL}/batches/expiring-soon?days=${days}`);
    if (!response.ok) {
      throw new Error('Failed to fetch expiring batches');
    }
    return response.json();
  },

  // Get expired batches
  getExpired: async () => {
    const response = await fetch(`${API_BASE_URL}/batches/expired`);
    if (!response.ok) {
      throw new Error('Failed to fetch expired batches');
    }
    return response.json();
  },

  // Get low stock batches
  getLowStock: async (threshold: number = 5) => {
    const response = await fetch(`${API_BASE_URL}/batches/low-stock?threshold=${threshold}`);
    if (!response.ok) {
      throw new Error('Failed to fetch low stock batches');
    }
    return response.json();
  },

  // Create new batch
  create: async (batch: Omit<Batch, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });
    if (!response.ok) {
      throw new Error('Failed to create batch');
    }
    return response.json();
  },

  // Update batch
  update: async (id: string, batch: Partial<Batch>) => {
    const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });
    if (!response.ok) {
      throw new Error('Failed to update batch');
    }
    return response.json();
  },

  // Delete batch
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete batch');
    }
    return response.json();
  },

  // Update batch quantity
  updateQuantity: async (id: string, quantityChange: number) => {
    const response = await fetch(`${API_BASE_URL}/batches/${id}/quantity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quantityChange),
    });
    if (!response.ok) {
      throw new Error('Failed to update batch quantity');
    }
    return response.json();
  }
};
