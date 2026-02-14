import { API_CONFIG } from '@/lib/config';

const API_BASE_URL = `${API_CONFIG.BASE_URL}/shops`;

export interface Shop {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  timeZone: string;
  currency: string;
  language: string;
  businessHours: Record<string, string>;
  isActive: boolean;
  isMainBranch: boolean;
  creditLimit?: number;
  taxRate?: number;
  allowNegativeStock: boolean;
  requireWarehouseSelection: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  warehouseCount?: number;
  warehouses?: any[];
}

export const shopApi = {
  // Get all shops
  getAll: async (): Promise<Shop[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching shops:', error);
      throw error;
    }
  },

  // Get active shops
  getActive: async (): Promise<Shop[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active shops:', error);
      throw error;
    }
  },

  // Get shop by ID
  getById: async (id: string): Promise<Shop> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching shop:', error);
      throw error;
    }
  },

  // Get shop by code
  getByCode: async (code: string): Promise<Shop> => {
    try {
      const response = await fetch(`${API_BASE_URL}/code/${code}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching shop by code:', error);
      throw error;
    }
  },

  // Get main branch
  getMainBranch: async (): Promise<Shop> => {
    try {
      const response = await fetch(`${API_BASE_URL}/main`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching main branch:', error);
      throw error;
    }
  },

  // Create shop
  create: async (shop: Omit<Shop, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<Shop> => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shop),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, response.statusText, errorText);
        throw new Error(`Failed to create shop: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  // Update shop
  update: async (id: string, shop: Partial<Shop>): Promise<Shop> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shop),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, response.statusText, errorText);
        throw new Error(`Failed to update shop: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  // Delete shop
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, response.statusText, errorText);
        throw new Error(`Failed to delete shop: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  }
};
