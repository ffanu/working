import { Refund, RefundStatus } from '@/types/inventory';
import { API_CONFIG } from '@/lib/config';

const BASE_URL = `${API_CONFIG.BASE_URL}/refunds`;

export const refundsApi = {
  getAll: async (params?: {
    search?: string;
    status?: RefundStatus;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDir?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.customerId) searchParams.append('customerId', params.customerId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${BASE_URL}?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch refunds');
    return response.json();
  },

  getAllRefunds: async () => {
    const response = await fetch(`${BASE_URL}/all`);
    if (!response.ok) throw new Error('Failed to fetch all refunds');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch refund');
    return response.json();
  },

  getByCustomer: async (customerId: string) => {
    const response = await fetch(`${BASE_URL}/customer/${customerId}`);
    if (!response.ok) throw new Error('Failed to fetch customer refunds');
    return response.json();
  },

  getByStatus: async (status: RefundStatus) => {
    const response = await fetch(`${BASE_URL}/status/${status}`);
    if (!response.ok) throw new Error('Failed to fetch refunds by status');
    return response.json();
  },

  create: async (refund: Partial<Refund>) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refund),
    });
    if (!response.ok) throw new Error('Failed to create refund');
    return response.json();
  },

  update: async (id: string, refund: Partial<Refund>) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refund),
    });
    if (!response.ok) throw new Error('Failed to update refund');
    return response.json();
  },

  approve: async (id: string, approvedBy: string) => {
    const response = await fetch(`${BASE_URL}/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approvedBy }),
    });
    if (!response.ok) throw new Error('Failed to approve refund');
    return response.json();
  },

  reject: async (id: string, rejectedBy: string, reason: string) => {
    const response = await fetch(`${BASE_URL}/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rejectedBy, reason }),
    });
    if (!response.ok) throw new Error('Failed to reject refund');
    return response.json();
  },

  process: async (id: string, processedBy: string) => {
    const response = await fetch(`${BASE_URL}/${id}/process`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ processedBy }),
    });
    if (!response.ok) throw new Error('Failed to process refund');
    return response.json();
  },

  cancel: async (id: string) => {
    const response = await fetch(`${BASE_URL}/${id}/cancel`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to cancel refund');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete refund');
    return response.json();
  },

  getStats: async () => {
    const response = await fetch(`${BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch refund stats');
    return response.json();
  },
};


