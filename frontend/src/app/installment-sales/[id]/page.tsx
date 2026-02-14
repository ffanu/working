"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  Receipt,
  FileText,
  Building,
  Phone,
  Mail,
  MapPin,
  Package,
  TrendingUp,
  Percent,
  Calculator
} from "lucide-react";
import Link from "next/link";
import { installmentApi } from "@/lib/api/installments";
import { InstallmentPlan } from "@/types/installment";
import { InstallmentModificationDialog } from "@/components/installments/InstallmentModificationDialog";
import { ReceiptButton } from "@/components/installments/ReceiptButton";

export default function InstallmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const installmentId = params.id as string;

  const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Modification dialog state
  const [showModificationDialog, setShowModificationDialog] = useState(false);

  // Fetch installment plan details function
  const fetchInstallmentPlan = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Fetching latest installment plan data for:', installmentId);
      const plan = await installmentApi.getPlanById(installmentId);
      console.log('Fetched installment plan:', {
        id: plan.id,
        numberOfInstallments: plan.numberOfInstallments,
        installmentAmount: plan.installmentAmount,
        status: plan.status
      });
      setInstallmentPlan(plan);
    } catch (error) {
      console.error('Error fetching installment plan:', error);
      setError('Failed to load installment plan details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch installment plan details on mount
  useEffect(() => {
    if (installmentId) {
      fetchInstallmentPlan();
    }
  }, [installmentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handlePaymentClick = (installmentIndex: number, amount: number) => {
    setSelectedInstallmentIndex(installmentIndex);
    setPaymentAmount(amount.toString());
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!installmentPlan || !paymentAmount) return;

    setIsProcessingPayment(true);
    try {
      const paymentData = {
        amount: parseFloat(paymentAmount),
        paymentDate: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString()
      };

      await installmentApi.recordPayment(installmentPlan.id, selectedInstallmentIndex, paymentData);
      
      // Refresh the installment plan data
      const updatedPlan = await installmentApi.getPlanById(installmentId);
      setInstallmentPlan(updatedPlan);
      
      // Close modal and reset state
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading installment plan details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !installmentPlan) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Plan</h2>
            <p className="text-gray-600 mb-4">{error || 'Installment plan not found'}</p>
            <Link href="/installment-sales">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Installment Sales
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate payment statistics
  const paidInstallments = installmentPlan.payments?.filter(p => p.status === 'Paid').length || 0;
  const totalInstallments = installmentPlan.numberOfInstallments;
  const progressPercentage = (paidInstallments / totalInstallments) * 100;
  const nextDuePayment = installmentPlan.payments?.find(p => p.status === 'Pending');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/installment-sales">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Installment Plan Details
              </h1>
              <p className="text-gray-600">
                Plan ID: {installmentPlan.id?.slice(-8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowModificationDialog(true)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Modify Plan
            </Button>
            <ReceiptButton 
              installmentPlan={installmentPlan}
              variant="outline"
              size="sm"
              showText={true}
              className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
            />
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(installmentPlan.totalPrice)}</div>
              <p className="text-xs opacity-75">
                Down: {formatCurrency(installmentPlan.downPayment)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Paid Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(installmentPlan.totalPaid)}</div>
              <p className="text-xs opacity-75">
                {paidInstallments} of {totalInstallments} payments
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(installmentPlan.remainingBalance)}</div>
              <p className="text-xs opacity-75">
                {totalInstallments - paidInstallments} payments left
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Schedule */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Payment Schedule
                </CardTitle>
                <CardDescription>
                  Track all installment payments and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {installmentPlan.payments?.map((payment, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            payment.status === 'Paid' 
                              ? 'bg-green-100 text-green-600' 
                              : payment.status === 'Overdue'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Payment #{index + 1}
                          </div>
                          <div className="text-sm text-gray-500">
                            Due: {formatDate(payment.dueDate)}
                            {payment.paymentDate && (
                              <span className="ml-2">
                                • Paid: {formatDate(payment.paymentDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(payment.amountDue)}
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {payment.status === 'Paid' && <CheckCircle className="h-3 w-3" />}
                            {payment.status === 'Pending' && <Clock className="h-3 w-3" />}
                            {payment.status === 'Overdue' && <AlertCircle className="h-3 w-3" />}
                            {payment.status}
                          </span>
                        </div>
                        
                        {payment.status === 'Pending' && index === installmentPlan.payments?.findIndex(p => p.status === 'Pending') && (
                          <Button
                            size="sm"
                            onClick={() => handlePaymentClick(index, payment.amountDue)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan Details */}
          <div className="space-y-6">
            {/* Products Information */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-green-600" />
                  Products in this Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {installmentPlan.products?.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.category} • Qty: {product.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 text-sm">
                          {formatCurrency(product.totalPrice)}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-3 text-gray-500">
                      <Package className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                      <p className="text-xs">No product details available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Customer ID</div>
                    <div className="font-medium">{installmentPlan.customerId?.slice(-8)}</div>
                  </div>
                </div>
                {/* Add more customer details when available */}
              </CardContent>
            </Card>

            {/* Plan Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Interest Rate</div>
                    <div className="font-medium flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {installmentPlan.interestRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{installmentPlan.numberOfInstallments} months</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Monthly Payment</div>
                    <div className="font-medium">{formatCurrency(installmentPlan.installmentAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                      installmentPlan.status === 'Active' 
                        ? 'text-blue-600 bg-blue-50 border-blue-200'
                        : installmentPlan.status === 'Completed'
                        ? 'text-green-600 bg-green-50 border-green-200'
                        : 'text-red-600 bg-red-50 border-red-200'
                    }`}>
                      {installmentPlan.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium">{formatDate(installmentPlan.startDate)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="font-medium">{formatDate(installmentPlan.endDate)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Next Payment */}
            {nextDuePayment && (
              <Card className="shadow-lg border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Clock className="h-5 w-5" />
                    Next Payment Due
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(nextDuePayment.amountDue)}
                    </div>
                    <div className="text-sm text-orange-700">
                      Due: {formatDate(nextDuePayment.dueDate)}
                    </div>
                    <div className="text-xs text-orange-600 mt-2 p-2 bg-orange-100 rounded">
                      💡 Use the "Pay" button in the payment schedule above to make this payment
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Payment #{selectedInstallmentIndex + 1}
                  </Label>
                  <p className="text-sm text-gray-500">
                    Plan: {installmentPlan.id?.slice(-8)}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="paymentAmount" className="text-sm font-medium text-gray-700">
                    Payment Amount
                  </Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700">
                    Payment Date
                  </Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePaymentSubmit}
                    disabled={!paymentAmount || isProcessingPayment}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={isProcessingPayment}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modification Dialog */}
        {installmentPlan && (
          <InstallmentModificationDialog
            isOpen={showModificationDialog}
            onClose={() => setShowModificationDialog(false)}
            installmentPlan={installmentPlan}
            customerId={installmentPlan.customerId}
            onModificationRequested={() => {
              // Refresh the installment plan data after modification
              fetchInstallmentPlan();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
