"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { InstallmentPlanCreator } from "@/components/installments/InstallmentPlanCreator";
import { ProductSelector } from "@/components/installments/ProductSelector";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock?: number;
  description?: string;
}

export default function CreateInstallmentPage() {
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [planCreated, setPlanCreated] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  // Check for URL parameters to pre-select a product
  useEffect(() => {
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName');
    const productPrice = searchParams.get('productPrice');

    if (productId && productName && productPrice) {
      const preSelectedProduct: Product = {
        id: productId,
        name: decodeURIComponent(productName),
        price: parseFloat(productPrice),
        category: "Electronics", // Default category
        stock: 1 // Default stock
      };
      setSelectedProduct(preSelectedProduct);
    }
  }, [searchParams]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleConfirm = async (data: any) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call to create the installment plan
      // const response = await fetch('/api/installments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     productId: data.productId,
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
    setSelectedProduct(null);
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
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Your installment plan has been created and is now active. 
                  You will receive payment reminders before each due date.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Plan Details:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Product:</span>
                    <p className="font-medium">{selectedProduct?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{planData?.duration} months</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Payment:</span>
                    <p className="font-medium text-green-600">${planData?.monthlyPayment.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-medium text-blue-600">${planData?.totalPayable.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Link href="/installments" className="flex-1">
                  <Button className="w-full">
                    View All Installments
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Products
                  </Button>
                </Link>
              </div>
            </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show product selector if no product is selected
  if (!selectedProduct) {
    return (
      <MainLayout>
        <ProductSelector 
          onProductSelect={handleProductSelect}
          onCancel={() => window.history.back()}
        />
      </MainLayout>
    );
  }

  // Show installment creator if product is selected
  return (
    <MainLayout>
      <InstallmentPlanCreator 
        product={selectedProduct}
        onConfirm={handleConfirm}
        onCancel={handleBackToProducts}
      />
    </MainLayout>
  );
}
