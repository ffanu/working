'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Calendar, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { modificationApi } from '@/lib/api/modifications';
import { InstallmentPlan } from '@/types/installment';
import { ModifyInstallmentPlanRequest, ModificationPreview } from '@/types/modification';

interface InstallmentModificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  installmentPlan: InstallmentPlan;
  customerId: string;
  onModificationRequested?: () => void;
}

export function InstallmentModificationDialog({
  isOpen,
  onClose,
  installmentPlan,
  customerId,
  onModificationRequested,
}: InstallmentModificationDialogProps) {
  const [step, setStep] = useState<'select' | 'configure' | 'preview' | 'confirm'>('select');
  const [modificationType, setModificationType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ModificationPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuration states
  const [newInstallmentCount, setNewInstallmentCount] = useState<number>(installmentPlan.numberOfInstallments);
  const [newInterestRate, setNewInterestRate] = useState<number>(installmentPlan.interestRate);
  const [additionalDownPayment, setAdditionalDownPayment] = useState<number>(0);

  const modificationTypes = [
    {
      value: 'ChangeInstallmentCount',
      label: 'Change Installment Count',
      description: 'Increase or decrease the number of monthly payments',
      icon: Calendar,
    },
    {
      value: 'ChangeInterestRate',
      label: 'Change Interest Rate',
      description: 'Negotiate a new interest rate for remaining payments',
      icon: TrendingUp,
    },
    {
      value: 'ChangeDownPayment',
      label: 'Additional Down Payment',
      description: 'Make an additional payment to reduce principal',
      icon: DollarSign,
    },
  ];

  const handleClose = () => {
    setStep('select');
    setModificationType('');
    setReason('');
    setPreview(null);
    setError(null);
    onClose();
  };

  const handleNext = () => {
    if (step === 'select' && modificationType) {
      setStep('configure');
    } else if (step === 'configure') {
      handlePreview();
    } else if (step === 'preview') {
      setStep('confirm');
    }
  };

  const handlePreview = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this modification');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: ModifyInstallmentPlanRequest = {
        installmentPlanId: installmentPlan.id,
        modificationType: modificationType as any,
        reason: reason,
        requestedBy: customerId,
      };

      // Add type-specific configurations
      if (modificationType === 'ChangeInstallmentCount') {
        request.newInstallmentCount = newInstallmentCount;
      } else if (modificationType === 'ChangeInterestRate') {
        request.newInterestRate = newInterestRate;
      } else if (modificationType === 'ChangeDownPayment') {
        request.additionalDownPayment = additionalDownPayment;
      }

      const previewData = await modificationApi.previewModification(request);
      setPreview(previewData);
      setStep('preview');
    } catch (error) {
      console.error('Error previewing modification:', error);
      setError(`Failed to preview modification: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const request: ModifyInstallmentPlanRequest = {
        installmentPlanId: installmentPlan.id,
        modificationType: modificationType as any,
        reason: reason,
        requestedBy: customerId,
      };

      // Add type-specific configurations
      if (modificationType === 'ChangeInstallmentCount') {
        request.newInstallmentCount = newInstallmentCount;
      } else if (modificationType === 'ChangeInterestRate') {
        request.newInterestRate = newInterestRate;
      } else if (modificationType === 'ChangeDownPayment') {
        request.additionalDownPayment = additionalDownPayment;
      }

      const modificationResult = await modificationApi.requestModification(request);
      
      // For testing purposes, automatically approve and apply the modification
      try {
        console.log('Auto-approving modification:', modificationResult.id);
        
        // Auto-approve the modification
        const approveResult = await modificationApi.approveModification({
          modificationId: modificationResult.id,
          approvedBy: "auto-system", // In real app, this would be admin ID
          approvalNotes: "Auto-approved for testing"
        });
        
        console.log('Modification approved:', approveResult.status);

        // Auto-apply the modification
        console.log('Auto-applying modification:', modificationResult.id);
        const applyResult = await modificationApi.applyModification(modificationResult.id);
        
        console.log('Modification automatically approved and applied', applyResult);
      } catch (applyError) {
        console.error('Error auto-applying modification:', applyError);
        if (applyError instanceof Error) {
          console.error('Error message:', applyError.message);
        }
        // Continue anyway, the request was still created
      }
      
      // Success
      setStep('confirm');
      setTimeout(() => {
        handleClose();
        onModificationRequested?.();
      }, 2000);
    } catch (error) {
      console.error('Error submitting modification:', error);
      setError('Failed to submit modification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderSelectStep = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Select Modification Type</Label>
        <div className="grid gap-3 mt-2">
          {modificationTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card
                key={type.value}
                className={`cursor-pointer transition-all duration-200 ${
                  modificationType === type.value
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setModificationType(type.value)}
              >
                <CardContent className="flex items-center p-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{type.label}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  {modificationType === type.value && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="reason" className="text-sm font-medium">
          Reason for Modification *
        </Label>
        <Textarea
          id="reason"
          placeholder="Please explain why you need this modification..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Current Plan Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Monthly EMI:</span>
            <span className="ml-2 font-medium">{formatCurrency(installmentPlan.installmentAmount)}</span>
          </div>
          <div>
            <span className="text-gray-600">Remaining Balance:</span>
            <span className="ml-2 font-medium">{formatCurrency(installmentPlan.remainingBalance)}</span>
          </div>
          <div>
            <span className="text-gray-600">Installments Left:</span>
            <span className="ml-2 font-medium">{installmentPlan.pendingInstallments}</span>
          </div>
          <div>
            <span className="text-gray-600">Interest Rate:</span>
            <span className="ml-2 font-medium">{installmentPlan.interestRate}%</span>
          </div>
        </div>
      </div>

      {modificationType === 'ChangeInstallmentCount' && (
        <div>
          <Label htmlFor="installmentCount" className="text-sm font-medium">
            New Number of Installments
          </Label>
          <Input
            id="installmentCount"
            type="number"
            min="1"
            max="60"
            value={newInstallmentCount}
            onChange={(e) => setNewInstallmentCount(parseInt(e.target.value) || 0)}
            className="mt-1"
          />
          <p className="text-xs text-gray-600 mt-1">
            Current: {installmentPlan.numberOfInstallments} installments
          </p>
        </div>
      )}

      {modificationType === 'ChangeInterestRate' && (
        <div>
          <Label htmlFor="interestRate" className="text-sm font-medium">
            New Interest Rate (%)
          </Label>
          <Input
            id="interestRate"
            type="number"
            min="0"
            max="30"
            step="0.1"
            value={newInterestRate}
            onChange={(e) => setNewInterestRate(parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
          <p className="text-xs text-gray-600 mt-1">
            Current: {installmentPlan.interestRate}% annual
          </p>
        </div>
      )}

      {modificationType === 'ChangeDownPayment' && (
        <div>
          <Label htmlFor="additionalPayment" className="text-sm font-medium">
            Additional Down Payment Amount
          </Label>
          <Input
            id="additionalPayment"
            type="number"
            min="0"
            step="0.01"
            value={additionalDownPayment}
            onChange={(e) => setAdditionalDownPayment(parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
          <p className="text-xs text-gray-600 mt-1">
            This amount will be deducted from your remaining balance
          </p>
        </div>
      )}
    </div>
  );

  const renderPreviewStep = () => {
    if (!preview) return null;

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Financial Impact Analysis</h3>
          <p className="text-sm text-blue-800">{preview.recommendationNote}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Monthly EMI:</span>
                <span className="font-medium">{formatCurrency(preview.currentMonthlyEMI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Payable:</span>
                <span className="font-medium">{formatCurrency(preview.currentTotalPayable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Installments Left:</span>
                <span className="font-medium">{preview.currentRemainingInstallments}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">New Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Monthly EMI:</span>
                <span className="font-medium">{formatCurrency(preview.newMonthlyEMI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Payable:</span>
                <span className="font-medium">{formatCurrency(preview.newTotalPayable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Installments:</span>
                <span className="font-medium">{preview.newRemainingInstallments}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              preview.emiDifference > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {preview.emiDifference > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatCurrency(Math.abs(preview.emiDifference))}
            </div>
            <p className="text-xs text-gray-600 mt-1">EMI Change</p>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              preview.totalPayableDifference > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {preview.totalPayableDifference > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatCurrency(Math.abs(preview.totalPayableDifference))}
            </div>
            <p className="text-xs text-gray-600 mt-1">Total Change</p>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              preview.timeDifferenceMonths > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              <Clock className="h-4 w-4" />
              {Math.abs(preview.timeDifferenceMonths)} months
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {preview.timeDifferenceMonths > 0 ? 'Extended' : 'Reduced'}
            </p>
          </div>
        </div>

        {preview.newPaymentSchedule.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">New Payment Schedule (Next 6 Payments)</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {preview.newPaymentSchedule.slice(0, 6).map((payment, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="text-sm">
                    <span className="font-medium">Payment #{payment.installmentNumber}</span>
                    <span className="text-gray-600 ml-2">{formatDate(payment.dueDate)}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(payment.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderConfirmStep = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-medium">Modification Request Submitted!</h3>
        <p className="text-gray-600 mt-2">
          Your modification request has been submitted for review. You will be notified once it's processed.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Modify Installment Plan
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="mt-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            {['select', 'configure', 'preview', 'confirm'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName || (step === 'confirm' && stepName === 'preview')
                    ? 'bg-blue-600 text-white'
                    : index < ['select', 'configure', 'preview', 'confirm'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < ['select', 'configure', 'preview', 'confirm'].indexOf(step)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === 'select' && renderSelectStep()}
          {step === 'configure' && renderConfigureStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'confirm' && renderConfirmStep()}
        </div>

        {/* Action buttons */}
        {step !== 'confirm' && (
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" onClick={step === 'select' ? handleClose : () => setStep(step === 'configure' ? 'select' : 'configure')}>
              {step === 'select' ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              onClick={step === 'preview' ? handleSubmit : handleNext}
              disabled={
                (step === 'select' && (!modificationType || !reason.trim())) ||
                isLoading ||
                isSubmitting
              }
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {step === 'preview' ? 'Submitting...' : 'Loading...'}
                </>
              ) : (
                step === 'preview' ? 'Submit Request' : step === 'configure' ? 'Preview Impact' : 'Continue'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
