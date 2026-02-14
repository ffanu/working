import { 
  InstallmentPlan, 
  CreateInstallmentPlanDto, 
  CreateMultiProductInstallmentPlanDto,
  RecordPaymentDto,
  InstallmentCalculation 
} from '@/types/installment';
import { API_CONFIG } from '@/lib/config';

const API_BASE_URL = API_CONFIG.BASE_URL;

class InstallmentApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/installment${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Create a new installment plan
  async createPlan(planData: CreateInstallmentPlanDto): Promise<InstallmentPlan> {
    return this.request<InstallmentPlan>('/create', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  // Create a new multi-product installment plan
  async createMultiProductPlan(planData: CreateMultiProductInstallmentPlanDto): Promise<InstallmentPlan> {
    return this.request<InstallmentPlan>('/create-multi-product', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  // Get installment plan by ID
  async getPlanById(id: string): Promise<InstallmentPlan> {
    return this.request<InstallmentPlan>(`/${id}`);
  }

  // Get all installment plans
  async getAllPlans(): Promise<InstallmentPlan[]> {
    return this.request<InstallmentPlan[]>('');
  }

  // Get installment plans by customer ID
  async getPlansByCustomerId(customerId: string): Promise<InstallmentPlan[]> {
    return this.request<InstallmentPlan[]>(`/customer/${customerId}`);
  }

  // Get overdue installment plans
  async getOverduePlans(): Promise<InstallmentPlan[]> {
    return this.request<InstallmentPlan[]>('/overdue');
  }

  // Record a payment for a specific installment
  async recordPayment(
    planId: string, 
    installmentIndex: number, 
    paymentData: RecordPaymentDto
  ): Promise<InstallmentPlan> {
    return this.request<InstallmentPlan>(`/${planId}/payment/${installmentIndex}`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Update installment plan status
  async updatePlanStatus(planId: string, status: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${planId}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  }

  // Complete an installment plan
  async completePlan(planId: string): Promise<InstallmentPlan> {
    return this.request<InstallmentPlan>(`/${planId}/complete`, {
      method: 'POST',
    });
  }

  // Update overdue status for all plans
  async updateOverdueStatus(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/update-overdue-status', {
      method: 'POST',
    });
  }

  // Calculate installment amount
  async calculateInstallment(
    principalAmount: number,
    interestRate: number,
    numberOfMonths: number
  ): Promise<{ installmentAmount: number }> {
    const params = new URLSearchParams({
      principalAmount: principalAmount.toString(),
      interestRate: interestRate.toString(),
      numberOfMonths: numberOfMonths.toString(),
    });

    return this.request<{ installmentAmount: number }>(`/calculate-installment?${params}`);
  }

  // Helper method to calculate full installment details (client-side)
  calculateInstallmentDetails(
    totalPrice: number,
    downPayment: number,
    interestRate: number,
    numberOfMonths: number,
    startDate: Date
  ): InstallmentCalculation {
    const principalAmount = totalPrice - downPayment;
    
    let installmentAmount: number;
    if (interestRate === 0) {
      installmentAmount = principalAmount / numberOfMonths;
    } else {
      const monthlyRate = interestRate / 100 / 12;
      const numerator = principalAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths);
      const denominator = Math.pow(1 + monthlyRate, numberOfMonths) - 1;
      installmentAmount = numerator / denominator;
    }

    const totalAmountWithInterest = installmentAmount * numberOfMonths;
    const totalInterest = totalAmountWithInterest - principalAmount;

    // Generate payment schedule
    const paymentSchedule = [];
    for (let i = 0; i < numberOfMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      paymentSchedule.push({
        dueDate: dueDate.toISOString(),
        amountDue: Math.round(installmentAmount * 100) / 100,
        amountPaid: 0,
        status: 'Pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      totalAmountWithInterest: Math.round(totalAmountWithInterest * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      paymentSchedule,
    };
  }
}

export const installmentApi = new InstallmentApi();
