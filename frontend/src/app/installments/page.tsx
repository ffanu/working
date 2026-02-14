"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye
} from "lucide-react";
import Link from "next/link";
import { InstallmentPlan } from "@/types/installment";

// Mock data - replace with actual API calls
const mockInstallmentPlans: InstallmentPlan[] = [
  {
    id: "plan_1",
    saleId: "sale_123",
    customerId: "cust_456",
    products: [{
      productId: "prod_789",
      name: "Sample Product",
      price: 1199.99,
      quantity: 1,
      category: "Electronics",
      description: "Sample product description",
      totalPrice: 1199.99
    }],
    totalPrice: 1199.99,
    downPayment: 200,
    numberOfInstallments: 12,
    installmentAmount: 91.67,
    interestRate: 15,
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    status: "Active",
    payments: [],
    totalPaid: 275.01,
    remainingBalance: 924.98,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
    totalAmountWithInterest: 1100.04,
    paidInstallments: 3,
    pendingInstallments: 9,
    overdueInstallments: 0,
    isCompleted: false,
    nextDueDate: "2024-04-15"
  },
  {
    id: "plan_2",
    saleId: "sale_124",
    customerId: "cust_457",
    products: [{
      productId: "prod_790",
      name: "Sample Product 2",
      price: 599.99,
      quantity: 1,
      category: "Electronics",
      description: "Sample product 2 description",
      totalPrice: 599.99
    }],
    totalPrice: 599.99,
    downPayment: 100,
    numberOfInstallments: 6,
    installmentAmount: 91.67,
    interestRate: 15,
    startDate: "2024-02-01",
    endDate: "2024-07-01",
    status: "Completed",
    payments: [],
    totalPaid: 599.99,
    remainingBalance: 0,
    createdAt: "2024-01-25T14:30:00Z",
    updatedAt: "2024-07-01T09:15:00Z",
    totalAmountWithInterest: 550.02,
    paidInstallments: 6,
    pendingInstallments: 0,
    overdueInstallments: 0,
    isCompleted: true
  },
  {
    id: "plan_3",
    saleId: "sale_125",
    customerId: "cust_458",
    products: [{
      productId: "prod_791",
      name: "Sample Product 3",
      price: 2499.99,
      quantity: 1,
      category: "Electronics",
      description: "Sample product 3 description",
      totalPrice: 2499.99
    }],
    totalPrice: 2499.99,
    downPayment: 500,
    numberOfInstallments: 24,
    installmentAmount: 104.17,
    interestRate: 15,
    startDate: "2023-12-01",
    endDate: "2025-11-01",
    status: "Active",
    payments: [],
    totalPaid: 1041.70,
    remainingBalance: 1458.29,
    createdAt: "2023-11-25T16:45:00Z",
    updatedAt: "2024-01-10T11:20:00Z",
    totalAmountWithInterest: 2500.08,
    paidInstallments: 10,
    pendingInstallments: 13,
    overdueInstallments: 1,
    isCompleted: false,
    nextDueDate: "2024-01-01"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Defaulted':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function InstallmentsPage() {
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchInstallmentPlans = async () => {
      try {
        // Replace with actual API call
        // const response = await installmentApi.getAllPlans();
        // setInstallmentPlans(response);
        
        // Using mock data for now
        setTimeout(() => {
          setInstallmentPlans(mockInstallmentPlans);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching installment plans:", error);
        setLoading(false);
      }
    };

    fetchInstallmentPlans();
  }, []);

  const activeCount = installmentPlans.filter(plan => plan.status === 'Active').length;
  const completedCount = installmentPlans.filter(plan => plan.status === 'Completed').length;
  const overdueCount = installmentPlans.reduce((sum, plan) => sum + plan.overdueInstallments, 0);
  const totalOutstanding = installmentPlans
    .filter(plan => plan.status === 'Active')
    .reduce((sum, plan) => sum + plan.remainingBalance, 0);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Installment Plans</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Installment Plans</h1>
              <p className="text-gray-600">Manage and track all installment plans</p>
            </div>
            <Link href="/installments/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Plan
              </Button>
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Plans</p>
                    <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Plans</p>
                    <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Payments</p>
                    <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding Amount</p>
                    <p className="text-2xl font-bold text-purple-600">${totalOutstanding.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Installment Plans List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Installment Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {installmentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Plan #{plan.id}</h3>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                          {plan.overdueInstallments > 0 && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              {plan.overdueInstallments} Overdue
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Price:</span>
                            <p className="font-medium">${plan.totalPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Monthly Payment:</span>
                            <p className="font-medium text-green-600">${plan.installmentAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Progress:</span>
                            <p className="font-medium">
                              {plan.paidInstallments}/{plan.numberOfInstallments} payments
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Remaining:</span>
                            <p className="font-medium text-blue-600">${plan.remainingBalance.toFixed(2)}</p>
                          </div>
                        </div>

                        {plan.nextDueDate && plan.status === 'Active' && (
                          <div className="flex items-center gap-2 mt-3 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">
                              Next payment due: {new Date(plan.nextDueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/installments/${plan.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {installmentPlans.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No installment plans found</h3>
                  <p className="text-gray-600 mb-6">Get started by creating your first installment plan.</p>
                  <Link href="/installments/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Plan
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
