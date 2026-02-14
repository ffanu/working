"use client";

import { InstallmentPlanCreator } from "@/components/installments/InstallmentPlanCreator";
import { MainLayout } from "@/components/layout/MainLayout";

// Demo product
const demoProduct = {
  id: "demo_product_123",
  name: "MacBook Pro 16-inch M3 Max",
  price: 3999.99
};

export default function InstallmentDemoPage() {
  const handleConfirm = async (planData: any) => {
    console.log("Installment plan data:", planData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Installment plan created successfully!\n\nProduct: ${demoProduct.name}\nDuration: ${planData.duration} months\nMonthly Payment: $${planData.monthlyPayment}\nTotal: $${planData.totalPayable}`);
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel?")) {
      window.history.back();
    }
  };

  return (
    <MainLayout>
      <InstallmentPlanCreator 
        product={demoProduct}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </MainLayout>
  );
}


