"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Printer } from 'lucide-react';
import { InstallmentPlan } from '@/types/installment';
import { Customer } from '@/types/inventory';
import { generateInstallmentReceipt } from '@/lib/pdf/installmentReceipt';
import { customerApi } from '@/lib/api/customers';

interface ReceiptButtonProps {
  installmentPlan: InstallmentPlan;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
  className?: string;
}

export const ReceiptButton: React.FC<ReceiptButtonProps> = ({
  installmentPlan,
  variant = 'outline',
  size = 'default',
  showText = true,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReceipt = async () => {
    try {
      setIsGenerating(true);

      console.log('Generating receipt for installment plan:', installmentPlan);

      // Validate installment plan data
      if (!installmentPlan || !installmentPlan.id) {
        throw new Error('Invalid installment plan data');
      }

      if (!installmentPlan.customerId) {
        throw new Error('Customer ID is missing from installment plan');
      }

      // Fetch customer details
      const customer = await customerApi.getById(installmentPlan.customerId);
      console.log('Customer data:', customer);

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Business information (you can move this to a config file)
      const businessInfo = {
        name: 'Inventory Management System',
        address: '123 Business Street, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@inventoryapp.com'
      };

      // Generate PDF receipt
      generateInstallmentReceipt({
        installmentPlan,
        customer,
        businessInfo
      });

      console.log('Receipt generated successfully');

    } catch (error) {
      console.error('Error generating receipt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate receipt: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGenerateReceipt}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {isGenerating ? 'Generating...' : 'Receipt'}
        </span>
      )}
    </Button>
  );
};

interface PrintReceiptButtonProps {
  installmentPlan: InstallmentPlan;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const PrintReceiptButton: React.FC<PrintReceiptButtonProps> = ({
  installmentPlan,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrintReceipt = async () => {
    try {
      setIsGenerating(true);

      // Fetch customer details
      const customer = await customerApi.getById(installmentPlan.customerId);

      // Business information
      const businessInfo = {
        name: 'Inventory Management System',
        address: '123 Business Street, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@inventoryapp.com'
      };

      // Generate and automatically open print dialog
      generateInstallmentReceipt({
        installmentPlan,
        customer,
        businessInfo
      });

    } catch (error) {
      console.error('Error generating receipt for printing:', error);
      alert('Failed to generate receipt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrintReceipt}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isGenerating ? 'Generating...' : 'Print Receipt'}
      </span>
    </Button>
  );
};
