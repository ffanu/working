export interface InstallmentPayment {
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  paymentDate?: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentPlanProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  totalPrice: number;
}

export interface InstallmentPlan {
  id: string;
  saleId: string;
  customerId: string;
  products: InstallmentPlanProduct[];
  totalPrice: number;
  downPayment: number;
  numberOfInstallments: number;
  installmentAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Defaulted' | 'Cancelled' | 'Overdue';
  payments: InstallmentPayment[];
  totalPaid: number;
  remainingBalance: number;
  createdAt: string;
  updatedAt: string;
  
  // Computed properties
  totalAmountWithInterest: number;
  paidInstallments: number;
  pendingInstallments: number;
  overdueInstallments: number;
  isCompleted: boolean;
  nextDueDate?: string;
}

export interface CreateInstallmentPlanDto {
  SaleId: string;
  CustomerId: string;
  ProductId: string;
  TotalPrice: number;
  DownPayment: number;
  NumberOfMonths: number;
  InterestRate: number;
  StartDate: string;
}

export interface CreateMultiProductInstallmentPlanDto {
  customerId: string;
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    description: string;
    totalPrice: number;
  }[];
  totalPrice: number;
  downPayment: number;
  numberOfInstallments: number;
  interestRate: number;
  startDate: string;
}

export interface RecordPaymentDto {
  amount: number;
  paymentDate?: string;
  notes?: string;
}

export interface InstallmentCalculation {
  installmentAmount: number;
  totalAmountWithInterest: number;
  totalInterest: number;
  paymentSchedule: InstallmentPayment[];
}
