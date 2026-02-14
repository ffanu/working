"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calculator, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Clock,
  CheckCircle,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface InstallmentPlanCreatorProps {
  product: Product;
  onConfirm?: (planData: {
    productId: string;
    duration: number;
    monthlyPayment: number;
    totalPayable: number;
    startDate: Date;
  }) => void;
  onCancel?: () => void;
}

const DURATION_OPTIONS = [
  { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months" },
  { value: 12, label: "12 Months" }
];

const INTEREST_RATE = 15; // 15% annual interest rate

export function InstallmentPlanCreator({ 
  product, 
  onConfirm, 
  onCancel 
}: InstallmentPlanCreatorProps) {
  const [duration, setDuration] = useState<number>(12);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayable, setTotalPayable] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Calculate installment details
  useEffect(() => {
    if (product.price > 0 && duration > 0) {
      const principal = product.price;
      const monthlyRate = INTEREST_RATE / 100 / 12;
      
      // Calculate EMI using compound interest formula
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                  (Math.pow(1 + monthlyRate, duration) - 1);
      
      const total = emi * duration;
      
      setMonthlyPayment(Math.round(emi * 100) / 100);
      setTotalPayable(Math.round(total * 100) / 100);
    }
  }, [product.price, duration]);

  const handleConfirm = async () => {
    if (!onConfirm) return;
    
    setLoading(true);
    
    try {
      await onConfirm({
        productId: product.id,
        duration,
        monthlyPayment,
        totalPayable,
        startDate
      });
    } catch (error) {
      console.error("Error confirming installment plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const interestAmount = totalPayable - product.price;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Installment Plan</h1>
          <p className="text-gray-600">Configure payment terms and schedule for your product purchase</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product & Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Package className="h-6 w-6 text-blue-600" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">Product ID: {product.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Full Price</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Installment Configuration */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Calculator className="h-6 w-6 text-purple-600" />
                  Installment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Duration Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Installment Duration
                    </Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Installment Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 text-base justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Monthly Payment Display */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-green-600" />
                      <span className="font-medium text-green-800 text-lg">Monthly Payment</span>
                    </div>
                    <div className="text-3xl font-bold text-green-700">
                      ${monthlyPayment.toFixed(2)}
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    For {duration} months at {INTEREST_RATE}% annual interest
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary Card */}
            <Card className="border-0 shadow-lg sticky top-6">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                  Installment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Product Price</p>
                      <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Installment Plan</p>
                      <p className="text-xl font-semibold">{duration} Months</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Monthly Payment</p>
                      <p className="text-xl font-semibold text-green-600">${monthlyPayment.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Total Payable</p>
                      <p className="text-xl font-semibold text-blue-600">${totalPayable.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Interest Amount</p>
                      <p className="text-xl font-semibold text-orange-600">${interestAmount.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="text-xl font-semibold">{format(startDate, "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Payment Schedule:</strong> You will pay ${monthlyPayment.toFixed(2)} 
                      every month for {duration} months starting from {format(startDate, "MMM dd, yyyy")}. 
                      This includes {INTEREST_RATE}% annual interest.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Plan...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Confirm & Create Installment
                        </>
                      )}
                    </Button>
                    
                    {onCancel && (
                      <Button
                        variant="outline"
                        onClick={onCancel}
                        className="w-full h-12 text-base"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
