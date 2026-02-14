import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { InstallmentPlan } from '@/types/installment';
import { Customer } from '@/types/inventory';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReceiptData {
  installmentPlan: InstallmentPlan;
  customer: Customer;
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const generateInstallmentReceipt = (data: ReceiptData): void => {
  try {
    const { installmentPlan, customer, businessInfo } = data;
    
    console.log('PDF Generation - Installment Plan:', installmentPlan);
    console.log('PDF Generation - Customer:', customer);
    
    // Validate required data
    if (!installmentPlan) {
      throw new Error('Installment plan data is required');
    }
    
    if (!customer) {
      throw new Error('Customer data is required');
    }
    
    // Create new PDF document
    const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors
  const primaryColor = [79, 70, 229]; // Indigo
  const secondaryColor = [99, 102, 241]; // Purple
  const textColor = [31, 41, 55]; // Gray-800
  const lightGray = [243, 244, 246]; // Gray-100
  
  let yPosition = 20;
  
  // Header Section
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo?.name || 'Inventory Management System', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('INSTALLMENT SALE RECEIPT', pageWidth - 20, 25, { align: 'right' });
  doc.text(`Receipt #: ${installmentPlan.id?.slice(-8).toUpperCase()}`, pageWidth - 20, 32, { align: 'right' });
  
  yPosition = 50;
  
  // Business Info
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  if (businessInfo) {
    doc.text(businessInfo.address, 20, yPosition);
    doc.text(`Phone: ${businessInfo.phone}`, 20, yPosition + 6);
    doc.text(`Email: ${businessInfo.email}`, 20, yPosition + 12);
  }
  
  // Date and Invoice Info
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, yPosition, { align: 'right' });
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, pageWidth - 20, yPosition + 6, { align: 'right' });
  doc.text(`Status: ${installmentPlan.status}`, pageWidth - 20, yPosition + 12, { align: 'right' });
  
  yPosition += 25;
  
  // Customer Information Section
  doc.setFillColor(...lightGray);
  doc.rect(20, yPosition, pageWidth - 40, 25, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER INFORMATION', 25, yPosition + 8);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${customer.name}`, 25, yPosition + 16);
  doc.text(`Phone: ${customer.mobileNumber}`, 25, yPosition + 21);
  
  if (customer.email) {
    doc.text(`Email: ${customer.email}`, pageWidth/2 + 10, yPosition + 16);
  }
  if (customer.address) {
    doc.text(`Address: ${customer.address}`, pageWidth/2 + 10, yPosition + 21);
  }
  
  yPosition += 35;
  
  // Products Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTS', 20, yPosition);
  
  yPosition += 5;
  
  // Products Table
  const productRows = installmentPlan.products?.map((product, index) => [
    (index + 1).toString(),
    product.name || 'Product',
    product.category || 'General',
    product.quantity.toString(),
    `$${product.price.toFixed(2)}`,
    `$${(product.price * product.quantity).toFixed(2)}`
  ]) || [];
  
  doc.autoTable({
    startY: yPosition,
    head: [['#', 'Product Name', 'Category', 'Qty', 'Unit Price', 'Total']],
    body: productRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { left: 20, right: 20 },
    tableWidth: 'auto'
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Financial Summary Section
  const summaryData = [
    ['Subtotal:', `$${installmentPlan.totalPrice.toFixed(2)}`],
    ['Down Payment:', `$${installmentPlan.downPayment.toFixed(2)}`],
    ['Financed Amount:', `$${(installmentPlan.totalPrice - installmentPlan.downPayment).toFixed(2)}`],
    ['Interest Rate:', `${installmentPlan.interestRate}% per annum`],
    ['Number of Installments:', installmentPlan.numberOfInstallments.toString()],
    ['Monthly Payment:', `$${installmentPlan.installmentAmount.toFixed(2)}`],
    ['Total Amount Payable:', `$${(installmentPlan.installmentAmount * installmentPlan.numberOfInstallments + installmentPlan.downPayment).toFixed(2)}`]
  ];
  
  doc.setFillColor(...lightGray);
  doc.rect(pageWidth/2, yPosition - 5, pageWidth/2 - 20, summaryData.length * 6 + 10, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL SUMMARY', pageWidth/2 + 5, yPosition);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  summaryData.forEach((item, index) => {
    const y = yPosition + 8 + (index * 6);
    doc.text(item[0], pageWidth/2 + 5, y);
    doc.text(item[1], pageWidth - 25, y, { align: 'right' });
  });
  
  yPosition += summaryData.length * 6 + 20;
  
  // Payment Schedule Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT SCHEDULE', 20, yPosition);
  
  yPosition += 5;
  
  // Payment Schedule Table
  const paymentRows = installmentPlan.payments?.slice(0, 12).map((payment, index) => [
    payment.installmentNumber.toString(),
    new Date(payment.dueDate).toLocaleDateString(),
    `$${payment.amountDue.toFixed(2)}`,
    payment.status,
    payment.status === 'Paid' ? (payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A') : '-'
  ]) || [];
  
  doc.autoTable({
    startY: yPosition,
    head: [['#', 'Due Date', 'Amount', 'Status', 'Paid Date']],
    body: paymentRows,
    theme: 'grid',
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 }
    }
  });
  
  // Add more payment schedule if needed
  if (installmentPlan.payments && installmentPlan.payments.length > 12) {
    const remainingCount = installmentPlan.payments.length - 12;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`... and ${remainingCount} more installments`, 20, (doc as any).lastAutoTable.finalY + 8);
  }
  
  // Footer
  const footerY = pageHeight - 30;
  doc.setDrawColor(...primaryColor);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('Please keep this receipt for your records.', pageWidth / 2, footerY + 14, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 20, { align: 'center' });
  
  // Save the PDF
  const fileName = `installment-receipt-${installmentPlan.id?.slice(-8) || 'receipt'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  console.log('PDF saved successfully:', fileName);
  
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw error;
  }
};

export const previewInstallmentReceipt = (data: ReceiptData): string => {
  const { installmentPlan, customer, businessInfo } = data;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Generate the same PDF as above but return as data URL for preview
  // (Implementation would be similar to generateInstallmentReceipt)
  
  return doc.output('dataurlstring');
};
