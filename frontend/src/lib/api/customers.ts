import { Customer } from '@/types/inventory';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const customerApi = {
  // Get all customers
  getAll: async (params?: { search?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number }): Promise<{ data: Customer[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const url = `${API_BASE_URL}/customers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    return response.json();
  },

  // Get customer by ID
  getById: async (id: string): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }
    return response.json();
  },

  // Create new customer
  create: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, response.statusText, errorText);
        throw new Error(`Failed to create customer: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  // Update customer
  update: async (id: string, customer: Customer): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, response.statusText, errorText);
        throw new Error(`Failed to update customer: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  },

  // Delete customer
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
  },

  // Search customers
  search: async (query: string): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search customers');
    }
    return response.json();
  },
}; 