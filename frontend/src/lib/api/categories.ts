import { Category } from '@/types/inventory';
import { API_CONFIG } from '@/lib/config';

const BASE_URL = `${API_CONFIG.BASE_URL}/categories`;

export const categoryApi = {
  // Get all categories with pagination and search
  getAll: async (params?: {
    search?: string;
    sortBy?: string;
    sortDir?: string;
    page?: number;
    pageSize?: number;
  }) => {
    try {
      let query = '';
      if (params) {
        const q = [];
        if (params.search) q.push(`search=${encodeURIComponent(params.search)}`);
        if (params.sortBy) q.push(`sortBy=${encodeURIComponent(params.sortBy)}`);
        if (params.sortDir) q.push(`sortDir=${encodeURIComponent(params.sortDir)}`);
        if (params.page) q.push(`page=${params.page}`);
        if (params.pageSize) q.push(`pageSize=${params.pageSize}`);
        if (q.length) query = '?' + q.join('&');
      }

      const response = await fetch(`${BASE_URL}${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get all categories without pagination
  getAllCategories: async () => {
    try {
      const response = await fetch(`${BASE_URL}/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw error;
    }
  },

  // Get hierarchical categories
  getHierarchical: async () => {
    try {
      const response = await fetch(`${BASE_URL}/hierarchical`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching hierarchical categories:', error);
      throw error;
    }
  },

  // Get root categories
  getRootCategories: async () => {
    try {
      const response = await fetch(`${BASE_URL}/root`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching root categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getById: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Get category by code
  getByCode: async (code: string) => {
    try {
      const response = await fetch(`${BASE_URL}/code/${code}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching category by code:', error);
      throw error;
    }
  },

  // Get subcategories
  getSubCategories: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/subcategories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  // Get category statistics
  getStats: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  },

  // Get default category
  getDefault: async () => {
    try {
      const response = await fetch(`${BASE_URL}/default`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching default category:', error);
      throw error;
    }
  },

  // Create new category
  create: async (category: Partial<Category>) => {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  update: async (id: string, category: Partial<Category>) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  delete: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Set category as default
  setDefault: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/set-default`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error setting default category:', error);
      throw error;
    }
  },

  // Update sort order
  updateSortOrder: async (id: string, sortOrder: number) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/sort-order`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sortOrder),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating sort order:', error);
      throw error;
    }
  },
};


