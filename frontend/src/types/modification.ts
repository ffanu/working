export interface InstallmentModification {
  id: string;
  installmentPlanId: string;
  modificationType: 'ChangeInstallmentCount' | 'ChangeInterestRate' | 'AddProducts' | 'ChangeDownPayment';
  modificationDate: string;
  requestedBy: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Applied';
  previousPlan: InstallmentPlanSnapshot;
  newPlan: InstallmentPlanSnapshot;
  modificationDetails: ModificationDetails;
  appliedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentPlanSnapshot {
  totalPrice: number;
  downPayment: number;
  numberOfInstallments: number;
  installmentAmount: number;
  interestRate: number;
  remainingBalance: number;
  paidInstallments: number;
  totalPaid: number;
  products: InstallmentPlanProduct[];
  nextDueDate?: string;
}

export interface ModificationDetails {
  newInstallmentCount?: number;
  newInterestRate?: number;
  additionalProducts?: InstallmentPlanProduct[];
  additionalDownPayment?: number;
  financialImpact: FinancialImpact;
}

export interface FinancialImpact {
  oldMonthlyEMI: number;
  newMonthlyEMI: number;
  emiDifference: number;
  oldTotalPayable: number;
  newTotalPayable: number;
  totalPayableDifference: number;
  oldEndDate?: string;
  newEndDate?: string;
  timeDifferenceMonths: number;
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

export interface ModifyInstallmentPlanRequest {
  installmentPlanId: string;
  modificationType: 'ChangeInstallmentCount' | 'ChangeInterestRate' | 'AddProducts' | 'ChangeDownPayment';
  reason: string;
  requestedBy: string;
  newInstallmentCount?: number;
  newInterestRate?: number;
  additionalProducts?: AddProductRequest[];
  additionalDownPayment?: number;
}

export interface AddProductRequest {
  productId: string;
  quantity: number;
  price: number;
}

export interface ModificationPreview {
  installmentPlanId: string;
  modificationType: string;
  
  // Current Plan Details
  currentMonthlyEMI: number;
  currentRemainingBalance: number;
  currentRemainingInstallments: number;
  currentEndDate?: string;
  currentTotalPayable: number;

  // New Plan Details
  newMonthlyEMI: number;
  newRemainingBalance: number;
  newRemainingInstallments: number;
  newEndDate?: string;
  newTotalPayable: number;

  // Impact Analysis
  emiDifference: number;
  totalPayableDifference: number;
  timeDifferenceMonths: number;
  isFinanciallyBeneficial: boolean;
  recommendationNote: string;

  // New Payment Schedule
  newPaymentSchedule: InstallmentPaymentPreview[];
}

export interface InstallmentPaymentPreview {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingBalance: number;
}

export interface ApproveModificationRequest {
  modificationId: string;
  approvedBy: string;
  approvalNotes?: string;
}

export interface RejectModificationRequest {
  modificationId: string;
  rejectedBy: string;
  rejectionReason: string;
}


