"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  ShoppingCart, 
  Calculator, 
  Calendar as CalendarIcon, 
  DollarSign, 
  CheckCircle,
  Trash2,
  Plus,
  Minus,
  Package,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCart, CartProduct } from "@/contexts/CartContext";

interface MultiProductInstallmentCreatorProps {
  onConfirm?: (data: any) => void;
  onCancel?: () => void;
}

const DURATION_OPTIONS = [
  { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months" },
  { value: 12, label: "12 Months" }
];

const INTEREST_RATE = 5; // 5% annual interest rate

export function MultiProductInstallmentCreator({ 
  onConfirm, 
  onCancel 
}: MultiProductInstallmentCreatorProps) {
  const { state: cartState, updateQuantity, removeFromCart, clearCart } = useCart();
  const [duration, setDuration] = useState(6);
  const [downPayment, setDownPayment] = useState(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  // Calculations
  const totalPrice = cartState.totalPrice;
  const principalAmount = totalPrice - downPayment;
  const monthlyInterestRate = INTEREST_RATE / 100 / 12;
  const monthlyPayment = principalAmount > 0 
    ? principalAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, duration)) / 
      (Math.pow(1 + monthlyInterestRate, duration) - 1)
    : 0;
  const totalPayable = downPayment + (monthlyPayment * duration);
  const interestAmount = totalPayable - totalPrice;

  const handleConfirm = async () => {
    if (cartState.items.length === 0) {
      alert("Please add products to cart first");
      return;
    }

    if (downPayment >= totalPrice) {
      alert("Down payment must be less than total price");
      return;
    }

    setLoading(true);

    const installmentData = {
      products: cartState.items,
      totalPrice,
      downPayment,
      duration,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalPayable: parseFloat(totalPayable.toFixed(2)),
      interestAmount: parseFloat(interestAmount.toFixed(2)),
      startDate: startDate.toISOString(),
      customerId: "CUST_001" // This should come from user context
    };

    try {
      if (onConfirm) {
        await onConfirm(installmentData);
      }
      // Clear cart after successful creation
      clearCart();
    } catch (error) {
      console.error("Error creating installment plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Installment Cart</h1>
            <p className="text-gray-600">Your cart is empty. Add products to create an installment plan.</p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">
                Browse products and add them to your cart to create an installment plan.
              </p>
              <Button onClick={onCancel} className="px-8">
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Installment Plan</h1>
          <p className="text-gray-600">Configure payment terms for your selected products</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cart & Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Products Cart */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                  Selected Products Cart
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {cartState.items.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">${product.price.toFixed(2)} each</p>
                          {product.category && (
                            <Badge variant="outline" className="mt-1">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{product.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            ${(product.price * product.quantity).toFixed(2)}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(product.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Price:</span>
                      <span className="text-green-600">${totalPrice.toFixed(2)}</span>
                    </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration Selection */}
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

                {/* Down Payment */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Down Payment (Optional)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={downPayment || ""}
                    onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                    min="0"
                    max={totalPrice}
                    step="0.01"
                  />
                  <p className="text-sm text-gray-600">
                    Maximum: ${totalPrice.toFixed(2)}
                  </p>
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
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-xl font-semibold">{cartState.totalItems} items</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Total Price</p>
                      <p className="text-xl font-semibold">${totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Down Payment</p>
                      <p className="text-xl font-semibold">${downPayment.toFixed(2)}</p>
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
                      disabled={loading || cartState.items.length === 0}
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
                          Confirm & Create Installment Plan
                        </>
                      )}
                    </Button>
                    
                    {onCancel && (
                      <Button
                        variant="outline"
                        onClick={onCancel}
                        className="w-full h-12 text-base"
                      >
                        Back to Products
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


