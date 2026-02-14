import { API_CONFIG } from '../config';

export interface TransferOrderItem {
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  transferredQuantity: number;
  remainingQuantity: number;
  isFullyTransferred: boolean;
}

export interface TransferOrder {
  id?: string;
  transferNumber?: string;
  fromLocationId: string;
  fromLocationName: string;
  fromLocationType: 'warehouse' | 'shop';
  toLocationId: string;
  toLocationName: string;
  toLocationType: 'warehouse' | 'shop';
  items: TransferOrderItem[];
  status?: string;
  requestDate?: string;
  completedDate?: string;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  totalItems?: number;
  totalValue?: number;
}

const API_BASE = API_CONFIG.BASE_URL;

export const transferOrderApi = {
  // Get all transfer orders
  getAll: async (): Promise<TransferOrder[]> => {
    const response = await fetch(`${API_BASE}/transfer-orders`);
    if (!response.ok) throw new Error('Failed to fetch transfer orders');
    return response.json();
  },

  // Get transfer order by ID
  getById: async (id: string): Promise<TransferOrder> => {
    const response = await fetch(`${API_BASE}/transfer-orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch transfer order');
    return response.json();
  },

  // Create new transfer order
  create: async (transferOrder: TransferOrder): Promise<TransferOrder> => {
    try {
      console.log('Sending transfer order data:', transferOrder);
      const response = await fetch(`${API_BASE}/transfer-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferOrder),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const result = await response.json();
      console.log('Transfer order created successfully:', result);
      return result;
    } catch (error) {
      console.error('Transfer order creation error:', error);
      throw error;
    }
  },

  // Update transfer order
  update: async (id: string, transferOrder: TransferOrder): Promise<void> => {
    const response = await fetch(`${API_BASE}/transfer-orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferOrder),
    });
    if (!response.ok) throw new Error('Failed to update transfer order');
  },

  // Delete transfer order
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/transfer-orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transfer order');
  },

  // Approve transfer order
  approve: async (id: string, approvedBy: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/transfer-orders/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvedBy),
    });
    if (!response.ok) throw new Error('Failed to approve transfer order');
  },

  // Complete transfer order
  complete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/transfer-orders/${id}/complete`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to complete transfer order');
  },

  // Cancel transfer order
  cancel: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/transfer-orders/${id}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cancel transfer order');
  },

  // Get transfer orders by status
  getByStatus: async (status: string): Promise<TransferOrder[]> => {
    const response = await fetch(`${API_BASE}/transfer-orders/status/${status}`);
    if (!response.ok) throw new Error('Failed to fetch transfer orders by status');
    return response.json();
  },

  // Get summary
  getSummary: async (): Promise<any> => {
    const response = await fetch(`${API_BASE}/transfer-orders/summary`);
    if (!response.ok) throw new Error('Failed to fetch transfer order summary');
    return response.json();
  }
};
