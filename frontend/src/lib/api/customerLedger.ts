import { CustomerLedger, PaymentRequest } from '@/types/inventory';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const customerLedgerApi = {
  // Get all customer ledger entries
  getAll: async (): Promise<{ data: CustomerLedger[]; total: number }> => {
    const response = await fetch(`${API_BASE_URL}/customerledger`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer ledger');
    }
    return response.json();
  },

  // Get customer ledger summary
  getSummary: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/customerledger/summary`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer ledger summary');
    }
    return response.json();
  },

  // Get ledger entries for a specific customer
  getByCustomerId: async (customerId: string): Promise<{ data: CustomerLedger[]; total: number }> => {
    const response = await fetch(`${API_BASE_URL}/customerledger/customer/${customerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer ledger');
    }
    return response.json();
  },

  // Get detailed ledger for a specific customer with date range
  getDetailedByCustomer: async (
    customerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ data: any[]; total: number }> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(
      `${API_BASE_URL}/customerledger/customer/${customerId}/detailed?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch detailed customer ledger');
    }
    return response.json();
  },

  // Get customer ledger summary
  getCustomerLedgerSummary: async (customerId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/customerledger/customer/${customerId}/summary`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer ledger summary');
    }
    return response.json();
  },

  // Get current balance for a customer
  getCurrentBalance: async (customerId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/customerledger/customer/${customerId}/balance`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer balance');
    }
    return response.json();
  },

  // Add payment transaction
  addPayment: async (customerId: string, payment: PaymentRequest): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/customerledger/customer/${customerId}/payment`, {
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
  getByDateRange: async (startDate: string, endDate: string): Promise<{ data: CustomerLedger[]; total: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/customerledger/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch customer ledger by date range');
    }
    return response.json();
  },

  // Get ledger entries by transaction type
  getByType: async (transactionType: string): Promise<{ data: CustomerLedger[]; total: number }> => {
    const response = await fetch(`${API_BASE_URL}/customerledger/type/${transactionType}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer ledger by type');
    }
    return response.json();
  },
}; 