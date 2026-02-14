import { API_CONFIG } from '@/lib/config';
import {
  InstallmentModification,
  ModifyInstallmentPlanRequest,
  ModificationPreview,
  ApproveModificationRequest,
  RejectModificationRequest
} from '@/types/modification';

class ModificationApi {
  private baseUrl = `${API_CONFIG.BASE_URL}/InstallmentModification`;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('Making request to:', url, 'with config:', config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Preview modification impact before requesting
  async previewModification(request: ModifyInstallmentPlanRequest): Promise<ModificationPreview> {
    return this.request<ModificationPreview>('/preview', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Request a modification
  async requestModification(request: ModifyInstallmentPlanRequest): Promise<InstallmentModification> {
    return this.request<InstallmentModification>('/request', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get all modifications for a specific plan
  async getModificationsByPlanId(planId: string): Promise<InstallmentModification[]> {
    return this.request<InstallmentModification[]>(`/plan/${planId}`);
  }

  // Get pending modifications (Admin only)
  async getPendingModifications(): Promise<InstallmentModification[]> {
    return this.request<InstallmentModification[]>('/pending');
  }

  // Get modification by ID
  async getModificationById(id: string): Promise<InstallmentModification> {
    return this.request<InstallmentModification>(`/${id}`);
  }

  // Get modifications by customer
  async getModificationsByCustomer(customerId: string): Promise<InstallmentModification[]> {
    return this.request<InstallmentModification[]>(`/customer/${customerId}`);
  }

  // Approve modification (Admin only)
  async approveModification(request: ApproveModificationRequest): Promise<InstallmentModification> {
    return this.request<InstallmentModification>('/approve', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Reject modification (Admin only)
  async rejectModification(request: RejectModificationRequest): Promise<InstallmentModification> {
    return this.request<InstallmentModification>('/reject', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Apply approved modification
  async applyModification(modificationId: string): Promise<any> {
    return this.request<any>(`/apply/${modificationId}`, {
      method: 'POST',
    });
  }
}

export const modificationApi = new ModificationApi();
