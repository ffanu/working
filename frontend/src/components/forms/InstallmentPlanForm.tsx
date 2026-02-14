"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calculator, 
  Calendar, 
  DollarSign, 
  Percent, 
  Clock,
  AlertCircle,
  CheckCircle 
} from "lucide-react";
import { CreateInstallmentPlanDto, InstallmentCalculation } from "@/types/installment";
import { installmentApi } from "@/lib/api/installments";

interface InstallmentPlanFormProps {
  saleId?: string;
  customerId?: string;
  productId?: string;
  totalPrice?: number;
  onSuccess?: (planId: string) => void;
  onCancel?: () => void;
}

export function InstallmentPlanForm({
  saleId = "",
  customerId = "",
  productId = "",
  totalPrice = 0,
  onSuccess,
  onCancel
}: InstallmentPlanFormProps) {
  const [formData, setFormData] = useState<CreateInstallmentPlanDto>({
    saleId,
    customerId,
    productId,
    totalPrice,
    downPayment: 0,
    numberOfMonths: 12,
    interestRate: 15,
    startDate: new Date().toISOString().split('T')[0]
  });

  const [calculation, setCalculation] = useState<InstallmentCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate installment details when form data changes
  useEffect(() => {
    if (formData.totalPrice > 0 && formData.downPayment >= 0 && formData.numberOfMonths > 0) {
      try {
        const calc = installmentApi.calculateInstallmentDetails(
          formData.totalPrice,
          formData.downPayment,
          formData.interestRate,
          formData.numberOfMonths,
          new Date(formData.startDate)
        );
        setCalculation(calc);
      } catch (err) {
        console.error("Error calculating installment:", err);
        setCalculation(null);
      }
    }
  }, [formData]);

  const handleInputChange = (field: keyof CreateInstallmentPlanDto, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.saleId) return "Sale ID is required";
    if (!formData.customerId) return "Customer ID is required";
    if (!formData.productId) return "Product ID is required";
    if (formData.totalPrice <= 0) return "Total price must be greater than 0";
    if (formData.downPayment < 0) return "Down payment cannot be negative";
    if (formData.downPayment >= formData.totalPrice) return "Down payment must be less than total price";
    if (formData.numberOfMonths <= 0) return "Number of months must be greater than 0";
    if (formData.interestRate < 0) return "Interest rate cannot be negative";
    if (!formData.startDate) return "Start date is required";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const plan = await installmentApi.createPlan(formData);
      onSuccess?.(plan.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create installment plan");
    } finally {
      setLoading(false);
    }
  };

  const principalAmount = formData.totalPrice - formData.downPayment;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Create Installment Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="saleId">Sale ID</Label>
                <Input
                  id="saleId"
                  value={formData.saleId}
                  onChange={(e) => handleInputChange('saleId', e.target.value)}
                  placeholder="Enter sale ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  placeholder="Enter customer ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID</Label>
                <Input
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  placeholder="Enter product ID"
                  required
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPrice" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Price
                </Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalPrice}
                  onChange={(e) => handleInputChange('totalPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downPayment" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Down Payment
                </Label>
                <Input
                  id="downPayment"
                  type="number"
                  step="0.01"
                  min="0"
                  max={formData.totalPrice}
                  value={formData.downPayment}
                  onChange={(e) => handleInputChange('downPayment', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Terms Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfMonths" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Number of Months
                </Label>
                <Input
                  id="numberOfMonths"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.numberOfMonths}
                  onChange={(e) => handleInputChange('numberOfMonths', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Interest Rate (% per year)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Calculation Results */}
            {calculation && principalAmount > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">Installment Calculation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${calculation.installmentAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-blue-700">Monthly Payment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${principalAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-700">Principal Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${calculation.totalInterest.toFixed(2)}
                      </div>
                      <div className="text-sm text-orange-700">Total Interest</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ${calculation.totalAmountWithInterest.toFixed(2)}
                      </div>
                      <div className="text-sm text-purple-700">Total Amount</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                    <strong>Summary:</strong> Customer will pay ${formData.downPayment.toFixed(2)} upfront, 
                    then ${calculation.installmentAmount.toFixed(2)} per month for {formData.numberOfMonths} months. 
                    Total cost: ${(formData.downPayment + calculation.totalAmountWithInterest).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading || !calculation || principalAmount <= 0}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Plan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Installment Plan
                  </>
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


