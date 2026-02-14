import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Generic API functions
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage += ` - ${JSON.stringify(errorData)}`;
    } catch (e) {
      // If response is not JSON, use the status text
    }
    throw new Error(errorMessage);
  }

  // Handle responses that don't have a body (like 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  return response.json();
}

// Product API
export const productApi = {
  getAll: (params?: { search?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number }) => {
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
    return apiRequest<any>(`/products${query}`);
  },
  getById: (id: string) => apiRequest<any>(`/products/${id}`),
  create: (product: any) => apiRequest<any>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: (id: string, product: any) => apiRequest<any>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  delete: (id: string) => apiRequest<any>(`/products/${id}`, {
    method: 'DELETE',
  }),
  search: (query: string) => apiRequest<any[]>(`/products/search?q=${encodeURIComponent(query)}`),
};

// Supplier API
export const supplierApi = {
  getAll: (params?: { search?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/suppliers?${queryString}` : '/suppliers';
    return apiRequest<{ data: any[]; total: number }>(url);
  },
  getById: (id: string) => apiRequest<any>(`/suppliers/${id}`),
  create: (supplier: any) => apiRequest<any>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplier),
  }),
  update: (id: string, supplier: any) => apiRequest<any>(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(supplier),
  }),
  delete: (id: string) => apiRequest<any>(`/suppliers/${id}`, {
    method: 'DELETE',
  }),
  search: (query: string) => apiRequest<any[]>(`/suppliers/search?q=${encodeURIComponent(query)}`),
};

// Customer API
export const customerApi = {
  getAll: (params?: { search?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/customers?${queryString}` : '/customers';
    return apiRequest<{ data: any[]; total: number }>(url);
  },
  getById: (id: string) => apiRequest<any>(`/customers/${id}`),
  create: (customer: any) => apiRequest<any>('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  }),
  update: (id: string, customer: any) => apiRequest<any>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customer),
  }),
  delete: (id: string) => apiRequest<any>(`/customers/${id}`, {
    method: 'DELETE',
  }),
  search: (query: string) => apiRequest<any[]>(`/customers/search?q=${encodeURIComponent(query)}`),
};

// Purchase API
export const purchaseApi = {
  getAll: (params?: { search?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/purchases?${queryString}` : '/purchases';
    return apiRequest<{ data: any[]; total: number }>(url);
  },
  getById: (id: string) => apiRequest<any>(`/purchases/${id}`),
  create: (purchase: any) => apiRequest<any>('/purchases', {
    method: 'POST',
    body: JSON.stringify(purchase),
  }),
  update: (id: string, purchase: any) => apiRequest<any>(`/purchases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(purchase),
  }),
  delete: (id: string) => apiRequest<any>(`/purchases/${id}`, {
    method: 'DELETE',
  }),
  getBySupplier: (supplierId: string) => apiRequest<any[]>(`/purchases/supplier/${supplierId}`),
  getByStatus: (status: string) => apiRequest<any[]>(`/purchases/status/${status}`),
  getByDateRange: (startDate: string, endDate: string) => apiRequest<any[]>(`/purchases/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// Sale API
export const saleApi = {
  getAll: (params?: { search?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/sales?${queryString}` : '/sales';
    return apiRequest<{ data: any[]; total: number }>(url);
  },
  getById: (id: string) => apiRequest<any>(`/sales/${id}`),
  create: (sale: any) => apiRequest<any>('/sales', {
    method: 'POST',
    body: JSON.stringify(sale),
  }),
  update: (id: string, sale: any) => apiRequest<any>(`/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sale),
  }),
  delete: (id: string) => apiRequest<any>(`/sales/${id}`, {
    method: 'DELETE',
  }),
  getByCustomer: (customerId: string) => apiRequest<any[]>(`/sales/customer/${customerId}`),
  getByStatus: (status: string) => apiRequest<any[]>(`/sales/status/${status}`),
  getByDateRange: (startDate: string, endDate: string) => apiRequest<any[]>(`/sales/date-range?startDate=${startDate}&endDate=${endDate}`),
  generateInvoice: (id: string) => apiRequest<{ invoiceNumber: string; pdfUrl?: string }>(`/sales/${id}/invoice`, {
    method: 'POST',
  }),
};

// Export API
export const exportApi = {
  exportAll: async () => {
    const response = await fetch(`${API_BASE_URL}/export/all`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  
  exportProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/export/products`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  
  exportTransactions: async () => {
    const response = await fetch(`${API_BASE_URL}/export/transactions`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  
  exportPurchases: async () => {
    const response = await fetch(`${API_BASE_URL}/export/purchases`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchases_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  
  exportSales: async () => {
    const response = await fetch(`${API_BASE_URL}/export/sales`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  
  exportSuppliers: async () => {
    const response = await fetch(`${API_BASE_URL}/export/suppliers`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suppliers_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  
  exportCustomers: async () => {
    const response = await fetch(`${API_BASE_URL}/export/customers`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

// Backup API
export const backupApi = {
  createBackup: async () => {
    const response = await fetch(`${API_BASE_URL}/backup/create`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Backup creation failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  restoreBackup: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/backup/restore`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backup restoration failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  },

  clearAllData: async () => {
    const response = await fetch(`${API_BASE_URL}/backup/clear`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Data clearing failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  },
};

// Stock Movements API
export const stockMovementsApi = {
  getAll: (params?: { 
    productId?: string; 
    type?: string; 
    startDate?: string; 
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.productId) searchParams.append('productId', params.productId);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/stockmovements?${queryString}` : '/stockmovements';
    return apiRequest<any[]>(url);
  },

  getById: (id: string) => apiRequest<any>(`/stockmovements/${id}`),

  create: (data: any) => 
    apiRequest<any>('/stockmovements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByProduct: (productId: string) => 
    apiRequest<any[]>(`/stockmovements/product/${productId}`),

  getByType: (type: string) => 
    apiRequest<any[]>(`/stockmovements/type/${type}`),

  getByDateRange: (startDate: string, endDate: string) => 
    apiRequest<any[]>(`/stockmovements/date-range?startDate=${startDate}&endDate=${endDate}`),

  getSummary: () => 
    apiRequest<any[]>('/stockmovements/summary'),

  getCurrentStatus: () => 
    apiRequest<any[]>('/stockmovements/current-status'),
};

// Stock Adjustments API
export const stockAdjustmentsApi = {
  create: (data: any) => 
    apiRequest<any>('/stockadjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByProduct: (productId: string) => 
    apiRequest<any[]>(`/stockadjustments/product/${productId}`),

  getByDateRange: (startDate: string, endDate: string) => 
    apiRequest<any[]>(`/stockadjustments/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// Users API
export const usersApi = {
  getAll: (params?: { search?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    return apiRequest<{ data: any[]; total: number }>(url);
  },
  getById: (id: string) => apiRequest<any>(`/users/${id}`),
  create: (user: any) => apiRequest<any>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  update: (id: string, user: any) => apiRequest<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  }),
  delete: (id: string) => apiRequest<any>(`/users/${id}`, {
    method: 'DELETE',
  }),
  createAdmin: (user: any) => apiRequest<any>('/users/create-admin', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  getStats: () => apiRequest<any>('/users/stats'),
};

