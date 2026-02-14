import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface WarehouseStock {
  _id?: string;
  id?: string;
  productId: string;
  productName: string;
  productSKU: string;
  warehouseId: string;
  warehouseName: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  averageCost: number;
  location?: string;
  lastUpdated?: string;
  createdAt?: string;
  createdBy?: string;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  // Legacy fields for backward compatibility
  quantity?: number; // Deprecated: use availableQuantity
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  lastRestocked?: string;
  updatedAt?: string;
}

export const warehouseStocksApi = {
  // Get all warehouse stocks with filters
  getAll: async (params?: {
    search?: string;
    warehouseId?: string;
    productId?: string;
    sortBy?: string;
    sortDir?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.warehouseId) searchParams.append('warehouseId', params.warehouseId);
    if (params?.productId) searchParams.append('productId', params.productId);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/warehousestocks?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch warehouse stocks');
    }
    return response.json();
  },

  // Get stocks for a specific warehouse
  getByWarehouse: async (warehouseId: string): Promise<WarehouseStock[]> => {
    const response = await fetch(`${API_BASE_URL}/warehousestocks/warehouse/${warehouseId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch warehouse stocks');
    }
    return response.json();
  },

  // Get stocks for a specific product
  getByProduct: async (productId: string): Promise<WarehouseStock[]> => {
    const response = await fetch(`${API_BASE_URL}/warehousestocks/product/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product stocks');
    }
    return response.json();
  },

  // Get available stock for a product
  getAvailableStock: async (productId: string, requiredQuantity: number = 1): Promise<WarehouseStock[]> => {
    const response = await fetch(`${API_BASE_URL}/warehousestocks/available/${productId}?requiredQuantity=${requiredQuantity}`);
    if (!response.ok) {
      throw new Error('Failed to fetch available stock');
    }
    return response.json();
  },
};

