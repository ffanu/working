import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface Sale {
  id?: string;
  _id?: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  saleDate: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: string;
  notes?: string;
  createdAt?: string;
  invoiceNumber?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesQueryParams {
  search?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
}

export const saleApi = {
  async getAll(params: SalesQueryParams = {}): Promise<{ data: Sale[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/sales?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sales');
    }
    return response.json();
  },

  async getById(id: string): Promise<Sale> {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sale');
    }
    return response.json();
  },

  async create(sale: Omit<Sale, 'id' | '_id'>): Promise<Sale> {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sale),
    });
    if (!response.ok) {
      throw new Error('Failed to create sale');
    }
    return response.json();
  },

  async update(id: string, sale: Partial<Sale>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sale),
    });
    if (!response.ok) {
      throw new Error('Failed to update sale');
    }
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete sale');
    }
  },

  async getByCustomer(customerId: string): Promise<Sale[]> {
    const response = await fetch(`${API_BASE_URL}/sales/customer/${customerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer sales');
    }
    return response.json();
  },

  async getByStatus(status: string): Promise<Sale[]> {
    const response = await fetch(`${API_BASE_URL}/sales/status/${status}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sales by status');
    }
    return response.json();
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const response = await fetch(`${API_BASE_URL}/sales/date-range?startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sales by date range');
    }
    return response.json();
  },

  async generateInvoice(id: string): Promise<{ invoiceNumber: string; pdfUrl?: string }> {
    const response = await fetch(`${API_BASE_URL}/sales/${id}/invoice`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to generate invoice');
    }
    return response.json();
  },

  async getInvoice(id: string): Promise<{ invoiceNumber: string; pdfUrl?: string }> {
    const response = await fetch(`${API_BASE_URL}/sales/${id}/invoice`);
    if (!response.ok) {
      throw new Error('Failed to get invoice');
    }
    return response.json();
  }
}; 