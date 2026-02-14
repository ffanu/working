import { CashRegister, CashTransaction, ShiftSummary } from '@/types/inventory';
import { API_CONFIG } from '@/lib/config';

const BASE_URL = `${API_CONFIG.BASE_URL}/cashRegisters`;

export const cashRegistersApi = {
  getAll: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch cash registers');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch cash register');
    return response.json();
  },

  getByUser: async (userId: string) => {
    const response = await fetch(`${BASE_URL}/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user cash register');
    return response.json();
  },

  openShift: async (request: {
    registerName: string;
    location: string;
    userId: string;
    userName: string;
    openingCash: number;
  }) => {
    const response = await fetch(`${BASE_URL}/open-shift`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to open shift');
    return response.json();
  },

  closeShift: async (id: string, request: {
    userId: string;
    closingCash: number;
    notes: string;
  }) => {
    const response = await fetch(`${BASE_URL}/${id}/close-shift`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to close shift');
    return response.json();
  },

  suspendShift: async (id: string, userId: string) => {
    const response = await fetch(`${BASE_URL}/${id}/suspend-shift`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to suspend shift');
    return response.json();
  },

  resumeShift: async (id: string, userId: string) => {
    const response = await fetch(`${BASE_URL}/${id}/resume-shift`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to resume shift');
    return response.json();
  },

  cashIn: async (id: string, request: {
    amount: number;
    description: string;
    userId: string;
    userName: string;
    notes?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/${id}/cash-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to process cash in');
    return response.json();
  },

  cashOut: async (id: string, request: {
    amount: number;
    description: string;
    userId: string;
    userName: string;
    notes?: string;
  }) => {
    const response = await fetch(`${BASE_URL}/${id}/cash-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to process cash out');
    return response.json();
  },

  getTransactions: async (id: string, startDate?: string, endDate?: string) => {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append('startDate', startDate);
    if (endDate) searchParams.append('endDate', endDate);

    const response = await fetch(`${BASE_URL}/${id}/transactions?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  getShiftSummary: async (id: string) => {
    const response = await fetch(`${BASE_URL}/${id}/shift-summary`);
    if (!response.ok) throw new Error('Failed to fetch shift summary');
    return response.json();
  },

  getDailySummary: async (date: string) => {
    const response = await fetch(`${BASE_URL}/daily-summary?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch daily summary');
    return response.json();
  },
};


