import { SupplierLedger, PaymentRequest } from '@/types/inventory';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const supplierLedgerApi = {
  // Get all supplier ledger entries
  getAll: async (): Promise<{ data: SupplierLedger[]; total: number }> => {
    const response = await fetch(`${API_BASE_URL}/supplierledger`);
    if (!response.ok) {
      throw new Error('Failed to fetch supplier ledger');
    }
    return response.json();
  },

  // Get supplier ledger summary
  getSummary: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/supplierledger/summary`);
    if (!response.ok) {
      throw new Error('Failed to fetch supplier ledger summary');
    }
    return response.json();
  },

  // Get ledger entries for a specific supplier
  getBySupplierId: async (supplierId: string): Promise<{ data: SupplierLedger[]; total: number }> => {
    const response = await fetch(`${API_BASE_URL}/supplierledger/supplier/${supplierId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch supplier ledger');
    }
    return response.json();
  },

  // Get detailed ledger for a specific supplier with date range
  getDetailedBySupplier: async (
    supplierId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ data: any[]; total: number }> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(
      `${API_BASE_URL}/supplierledger/supplier/${supplierId}/detailed?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch detailed supplier ledger');
    }
    return response.json();
  },

  // Get supplier ledger summary
  getSupplierLedgerSummary: async (supplierId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/supplierledger/supplier/${supplierId}/summary`);
    if (!response.ok) {
      throw new Error('Failed to fetch supplier ledger summary');
    }
    return response.json();
  },

  // Get current balance for a supplier
  getCurrentBalance: async (supplierId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/supplierledger/supplier/${supplierId}/balance`);
    if (!response.ok) {
      throw new Error('Failed to fetch supplier balance');
    }
    return response.json();
  },

  // Add payment transaction
  addPayment: async (supplierId: string, payment: PaymentRequest): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/supplierledger/supplier/${supplierId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payment),
    });
    if (!response.ok) {
      throw new Error('Failed to add payment');
    }
    return response.json();
  },

  // Get ledger entries by date range
  getByDateRange: async (startDate: string, endDate: string): Promise<{ data: SupplierLedger[]; total: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/supplierledger/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch supplier ledger by date range');
    }
    return response.json();
  },

  // Get ledger entries by transaction type
  getByType: async (transactionType: string): Promise<{ data: SupplierLedger[]; total: number }> => {
    const response = await fetch(`${API_BASE_URL}/supplierledger/type/${transactionType}`);
    if (!response.ok) {
      throw new Error('Failed to fetch supplier ledger by type');
    }
    return response.json();
  },
}; 