import { API_CONFIG } from '../config';

// Warehouse interface (defined locally to avoid import issues)
export interface Warehouse {
  _id?: string;
  id?: string;
  shopId?: string;
  shopName?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  type: 'Warehouse' | 'Store' | 'Distribution Center';
  status?: 'Active' | 'Inactive' | 'Maintenance';
  isDefault: boolean;
  isActive: boolean;
  totalCapacity?: number;
  usedCapacity?: number;
  maxProducts?: number;
  operatingHours?: string;
  hasRefrigeration: boolean;
  hasFreezer: boolean;
  hasHazardousStorage: boolean;
  hasSecuritySystem: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  
  // Computed properties
  capacityUtilization?: number;
  isNearCapacity?: boolean;
}

const API_BASE_URL = API_CONFIG.BASE_URL;

export const warehousesApi = {
  // Get all warehouses with pagination and search
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

    const response = await fetch(`${API_BASE_URL}/warehouses?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch warehouses');
    }
    return response.json();
  },

  // Get warehouse by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch warehouse');
    }
    return response.json();
  },

  // Get default warehouse
  getDefault: async () => {
    const response = await fetch(`${API_BASE_URL}/warehouses/default`);
    if (!response.ok) {
      throw new Error('Failed to fetch default warehouse');
    }
    return response.json();
  },

  // Get active warehouses
  getActive: async () => {
    const response = await fetch(`${API_BASE_URL}/warehouses/active`);
    if (!response.ok) {
      throw new Error('Failed to fetch active warehouses');
    }
    return response.json();
  },

  // Get warehouses by shop ID
  getByShopId: async (shopId: string) => {
    const response = await fetch(`${API_BASE_URL}/warehouses/shop/${shopId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch warehouses by shop');
    }
    return response.json();
  },

  // Create new warehouse
  create: async (warehouse: Omit<Warehouse, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE_URL}/warehouses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(warehouse),
    });
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to create warehouse';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  // Update warehouse
  update: async (id: string, warehouse: Partial<Warehouse>) => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(warehouse),
    });
    if (!response.ok) {
      throw new Error('Failed to update warehouse');
    }
    return response.json();
  },

  // Delete warehouse
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete warehouse');
    }
    return response.json();
  },

  // Set default warehouse
  setDefault: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}/set-default`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to set default warehouse');
    }
    return response.json();
  }
};
