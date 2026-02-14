"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MultiProductInstallmentCreator } from "@/components/cart/MultiProductInstallmentCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
  const [planCreated, setPlanCreated] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  const handleConfirm = async (data: any) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call to create the multi-product installment plan
      // const response = await fetch('/api/installments/multi-product', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     customerId: data.customerId,
      //     products: data.products,
      //     totalPrice: data.totalPrice,
      //     downPayment: data.downPayment,
      //     duration: data.duration,
      //     monthlyPayment: data.monthlyPayment,
      //     totalPayable: data.totalPayable,
      //     startDate: data.startDate
      //   })
      // });
      
      setPlanData(data);
      setPlanCreated(true);
    } catch (error) {
      console.error("Error creating installment plan:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleBackToProducts = () => {
    // Navigate back to products page
    window.location.href = '/products';
  };

  if (planCreated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-green-800">
                  Installment Plan Created Successfully!
                </CardTitle>
                <div className="text-green-700 mt-2">
                  Your multi-product installment plan has been set up and is now active.
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <p className="text-gray-600 text-lg">
                    You will receive a confirmation email with your payment schedule and plan details.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg">Plan Summary:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Products:</span>
                        <p className="font-medium">{planData?.products?.length} items</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">{planData?.duration} months</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Price:</span>
                        <p className="font-medium">${planData?.totalPrice?.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Down Payment:</span>
                        <p className="font-medium">${planData?.downPayment?.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Monthly Payment:</span>
                        <p className="font-medium text-green-600">${planData?.monthlyPayment?.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Payable:</span>
                        <p className="font-medium text-blue-600">${planData?.totalPayable?.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Products in Plan:</h4>
                      <div className="space-y-2">
                        {planData?.products?.map((product: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                            <div>
                              <span className="font-medium">{product.name}</span>
                              <span className="text-gray-600 ml-2">x{product.quantity}</span>
                            </div>
                            <span className="font-medium">${(product.price * product.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Link href="/installments">
                      <Button className="px-8">
                        View All Plans
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" className="px-8">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <MultiProductInstallmentCreator 
        onConfirm={handleConfirm}
        onCancel={handleBackToProducts}
      />
    </MainLayout>
  );
}


