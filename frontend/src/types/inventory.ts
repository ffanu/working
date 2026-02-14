export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
  sku: string;
  supplier: string;
  costPrice?: number;
  unit?: string;
  isActive?: boolean;
  images?: string[]; // Array of image URLs
  mainImage?: string; // Primary image URL
  minStockLevel?: number; // Minimum stock level for alerts
  reorderPoint?: number; // Reorder point for alerts
  lastRestocked?: string; // Last restock date
  tags?: string[]; // Product tags for categorization
  barcode?: string; // Product barcode
  weight?: number; // Product weight
  dimensions?: string; // Product dimensions
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  code: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  level: number;
  sortOrder: number;
  color: string;
  icon: string;
  isActive: boolean;
  isDefault: boolean;
  requiresSerialNumber: boolean;
  requiresBatchTracking: boolean;
  requiresExpiryDate: boolean;
  defaultShelfLifeDays?: number;
  defaultStorageConditions?: string;
  defaultProfitMargin?: number;
  defaultMarkupPercentage?: number;
  defaultMinStockLevel?: number;
  defaultReorderPoint?: number;
  tags: string[];
  customFields: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  productCount?: number;
  totalValue?: number;
  subCategories?: Category[];
}


export interface StockAdjustment {
  _id?: string;
  id?: string;
  productId: string;
  productName: string;
  productSKU: string;
  adjustmentType: 'Add' | 'Subtract' | 'Set';
  quantity: number;
  reason: string;
  notes?: string;
  adjustedBy: string;
  adjustedAt: string;
  stockBefore: number;
  stockAfter: number;
}

// Refund and Return Types
export type RefundStatus = 'Pending' | 'Approved' | 'Rejected' | 'Processed' | 'Cancelled';
export type RefundType = 'FullRefund' | 'PartialRefund' | 'Exchange' | 'StoreCredit';
export type RefundReason = 'Defective' | 'WrongItem' | 'SizeIssue' | 'QualityIssue' | 'CustomerRequest' | 'DamagedInTransit' | 'Expired' | 'Other';

export interface RefundItem {
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  refundAmount: number;
  itemNotes?: string;
  itemCondition: string;
  restockItem: boolean;
  restockQuantity: number;
}

export interface Refund {
  _id?: string;
  id?: string;
  originalSaleId: string;
  customerId: string;
  customerName: string;
  refundDate: string;
  status: RefundStatus;
  type: RefundType;
  reason: RefundReason;
  notes?: string;
  items: RefundItem[];
  totalRefundAmount: number;
  processingFee?: number;
  netRefundAmount: number;
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  refundMethod: string;
  storeCreditId?: string;
  storeCreditAmount: number;
  returnShippingRequired: boolean;
  returnShippingMethod?: string;
  returnShippingCost: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isProcessed: boolean;
  isApproved: boolean;
  canBeProcessed: boolean;
}

// Cash Register Types
export type ShiftStatus = 'Open' | 'Closed' | 'Suspended';
export type TransactionType = 'CashIn' | 'CashOut' | 'Sale' | 'Refund' | 'Adjustment' | 'Transfer';

export interface CashTransaction {
  _id?: string;
  id?: string;
  cashRegisterId: string;
  registerName: string;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  saleId?: string;
  refundId?: string;
  customerId?: string;
  customerName?: string;
  userId: string;
  userName: string;
  cashBefore: number;
  cashAfter: number;
  paymentMethod: string;
  reference: string;
  transactionTime: string;
  createdAt: string;
  createdBy: string;
  isCashIn: boolean;
  isCashOut: boolean;
  isSale: boolean;
  isRefund: boolean;
}

export interface CashRegister {
  _id?: string;
  id?: string;
  registerName: string;
  location: string;
  currentUserId: string;
  currentUserName: string;
  shiftStartTime: string;
  shiftEndTime?: string;
  status: ShiftStatus;
  openingCash: number;
  currentCash: number;
  expectedCash: number;
  cashDifference: number;
  totalSales: number;
  totalRefunds: number;
  totalCashIn: number;
  totalCashOut: number;
  netCashFlow: number;
  cashPayments: number;
  cardPayments: number;
  creditPayments: number;
  otherPayments: number;
  totalTransactions: number;
  cashTransactions: number;
  cardTransactions: number;
  creditTransactions: number;
  shiftNotes?: string;
  closingNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isOpen: boolean;
  isClosed: boolean;
  shiftDuration: string;
}

export interface ShiftSummary {
  registerName: string;
  userName: string;
  shiftStart: string;
  shiftEnd: string;
  duration: string;
  openingCash: number;
  closingCash: number;
  totalSales: number;
  totalRefunds: number;
  netCashFlow: number;
  totalTransactions: number;
  cashDifference: number;
  status: string;
}




export interface Supplier {
  _id?: string;
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export interface CustomerLedger {
  _id?: string;
  id?: string;
  customerId: string;
  customerName: string;
  transactionId: string;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description: string;
  transactionDate: string;
  createdAt: string;
  createdBy: string;
  isActive?: boolean;
}

export interface SupplierLedger {
  _id?: string;
  id?: string;
  supplierId: string;
  supplierName: string;
  transactionId: string;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description: string;
  transactionDate: string;
  createdAt: string;
  createdBy: string;
  isActive?: boolean;
}

export interface PaymentRequest {
  amount: number;
  reference: string;
  description: string;
  createdBy?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  // Warehouse-specific item tracking
  batchNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
}

export interface Purchase {
  id?: string;
  _id?: string;
  supplierId: string;
  supplierName: string;
  // Warehouse relationship fields
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  items: PurchaseItem[];
  totalAmount: number;
  purchaseDate: string;
  status: 'pending' | 'received' | 'cancelled';
  paymentMethod: string;
  challanNumber: string;
  invoiceNumber: string;
  deliveryNote: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveryAddress: string;
  contactPerson: string;
  contactPhone: string;
  purchaseOrderNumber: string;
  paymentTerms: string;
  discountAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  deliveryTime?: number;
  qualityRating?: number;
  onTimeDelivery?: boolean;
}

// NEW: Enhanced Product interface with new fields
export interface EnhancedProduct extends Product {
  barcode?: string;
  qrCode?: string;
  location?: string;
  brand?: string;
  model?: string;
  weight?: number;
  dimensions?: string;
  requiresSerialNumber?: boolean;
  requiresBatchTracking?: boolean;
  shelfLifeDays?: number;
  storageConditions?: string;
  wholesalePrice?: number;
  retailPrice?: number;
  discountPrice?: number;
  discountValidUntil?: string;
  supplierSKU?: string;
  leadTimeDays?: number;
  minimumOrderQuantity?: number;
  tags?: string[];
  imageUrls?: string[];
  mainImageUrl?: string;
}

// NEW: Batch tracking interface
export interface Batch {
  _id?: string;
  id?: string;
  productId: string;
  productName: string;
  productSKU: string;
  batchNumber: string;
  lotNumber: string;
  manufactureDate: string;
  expiryDate?: string;
  initialQuantity: number;
  currentQuantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  supplierInvoice: string;
  location: string;
  status: 'Active' | 'Expired' | 'Recalled' | 'Depleted';
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Computed properties
  isExpired?: boolean;
  isLowStock?: boolean;
  daysUntilExpiry?: number;
  isExpiringSoon?: boolean;
}

// NEW: Warehouse interface  
export interface Warehouse {
  _id?: string;
  id?: string;
  shopId: string;
  shopName: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  type: 'Warehouse' | 'Store' | 'Distribution Center';
  status?: 'Active' | 'Inactive' | 'Maintenance';
  isDefault: boolean;
  isActive: boolean;
  totalCapacity?: number;
  usedCapacity?: number;
  maxProducts?: number;
  operatingHours?: string;
  hasRefrigeration: boolean;
  hasFreezer: boolean;
  hasHazardousStorage: boolean;
  hasSecuritySystem: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  
  // Computed properties
  capacityUtilization?: number;
  isNearCapacity?: boolean;
}

// NEW: Warehouse stock interface
export interface WarehouseStock {
  _id?: string;
  id?: string;
  productId: string;
  productName: string;
  productSKU: string;
  warehouseId: string;
  warehouseName: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  averageCost: number;
  totalValue: number;
  location: string;
  status: 'Active' | 'Inactive' | 'Under Review';
  lastUpdated: string;
  createdAt?: string;
  createdBy?: string;
  
  // Computed properties
  isLowStock?: boolean;
  isOutOfStock?: boolean;
} 

export interface Sale {
  id?: string;
  _id?: string;
  customerId: string;
  customerName: string;
  // NEW: Warehouse relationship fields
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  items: SaleItem[];
  totalAmount: number;
  saleDate: string;
  status: string;
  paymentMethod: string;
  notes?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isActive?: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costPrice?: number;
  // NEW: Warehouse-specific item tracking
  warehouseId?: string;
  warehouseName?: string;
} 

// NEW: Advanced Inventory Tracking Models
export interface StockReconciliation {
  id?: string;
  _id?: string;
  warehouseId: string;
  warehouseName: string;
  reconciledBy: string;
  reconciledAt: string;
  status: string;
  notes?: string;
  items: StockReconciliationItem[];
  totalVariance: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface StockReconciliationItem {
  productId: string;
  productName: string;
  productSKU: string;
  systemQuantity: number;
  physicalQuantity: number;
  variance: number;
  unitCost: number;
  varianceValue: number;
  batchNumber?: string;
  location?: string;
  notes?: string;
}

export interface GoodsReceivedNote {
  id?: string;
  _id?: string;
  purchaseOrderId: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  receivedBy: string;
  receivedAt: string;
  status: string;
  notes?: string;
  items: GRNItem[];
  totalReceivedValue: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface GRNItem {
  productId: string;
  productName: string;
  productSKU: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  qualityNotes?: string;
  qualityStatus: string;
}

export interface StockAlert {
  id?: string;
  _id?: string;
  productId: string;
  productName: string;
  productSKU: string;
  warehouseId: string;
  warehouseName: string;
  alertType: string;
  severity: string;
  message: string;
  currentQuantity: number;
  thresholdQuantity: number;
  currentValue?: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
  agingDays?: number;
  status: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
} 

// NEW: Enterprise-Level Models
export interface WarehouseOperation {
  id?: string;
  _id?: string;
  operationType: string;
  warehouseId: string;
  warehouseName: string;
  referenceNumber: string;
  referenceType: string;
  status: string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  assignedTo: string;
  items: WarehouseOperationItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface WarehouseOperationItem {
  productId: string;
  productName: string;
  productSKU: string;
  requiredQuantity: number;
  pickedQuantity: number;
  packedQuantity: number;
  shippedQuantity: number;
  batchNumber?: string;
  binLocation?: string;
  pickLocation?: string;
  packLocation?: string;
  status: string;
  pickedAt?: string;
  pickedBy?: string;
  packedAt?: string;
  packedBy?: string;
  shippedAt?: string;
  shippedBy?: string;
  notes?: string;
}

export interface Currency {
  id?: string;
  _id?: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBaseCurrency: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id?: string;
  _id?: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  effectiveDate: string;
  expiryDate?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface DemandForecast {
  id?: string;
  _id?: string;
  productId: string;
  productName: string;
  productSKU: string;
  warehouseId: string;
  warehouseName: string;
  forecastDate: string;
  forecastPeriod: number;
  predictedDemand: number;
  confidenceLevel: number;
  seasonalFactor: number;
  trendFactor: number;
  algorithm: string;
  historicalData: ForecastDataPoint[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ForecastDataPoint {
  date: string;
  actualDemand: number;
  predictedDemand: number;
  error: number;
}

export interface BusinessIntelligence {
  id?: string;
  _id?: string;
  metricName: string;
  metricType: string;
  entityId: string;
  entityType: string;
  currentValue: number;
  targetValue: number;
  previousValue: number;
  changePercentage: number;
  trend: string;
  status: string;
  measurementDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface StockAging {
  id?: string;
  _id?: string;
  productId: string;
  productName: string;
  productSKU: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  daysInStock: number;
  stockValue: number;
  unitCost: number;
  agingCategory: string;
  lastMovementDate?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AuditLog {
  id?: string;
  _id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  severity: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  timestamp: string;
  oldValues?: string;
  newValues?: string;
  additionalData?: string;
  isActive: boolean;
}

export interface SecurityEvent {
  id?: string;
  _id?: string;
  eventType: string;
  severity: string;
  description: string;
  userId?: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  additionalData?: string;
  timestamp: string;
  status: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  isActive: boolean;
}

export interface ComplianceRecord {
  id?: string;
  _id?: string;
  complianceType: string;
  requirement: string;
  description: string;
  status: string;
  dueDate: string;
  completedDate?: string;
  responsiblePerson?: string;
  evidence?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
} 

// NEW: Logistics & Supply Chain Models
export interface DeliveryOrder {
  id?: string;
  _id?: string;
  salesOrderId: string;
  deliveryNumber: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  deliveryAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  scheduledDeliveryDate: string;
  actualDeliveryDate?: string;
  status: string;
  carrierId?: string;
  carrierName?: string;
  trackingNumber?: string;
  routeId?: string;
  items: DeliveryItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface DeliveryItem {
  productId: string;
  productName: string;
  productSKU: string;
  orderedQuantity: number;
  pickedQuantity: number;
  packedQuantity: number;
  shippedQuantity: number;
  deliveredQuantity: number;
  batchNumber?: string;
  binLocation?: string;
  status: string;
  pickedAt?: string;
  pickedBy?: string;
  packedAt?: string;
  packedBy?: string;
  shippedAt?: string;
  shippedBy?: string;
  deliveredAt?: string;
  deliveredBy?: string;
  notes?: string;
}

export interface Shipment {
  id?: string;
  _id?: string;
  shipmentNumber: string;
  carrierId: string;
  carrierName: string;
  trackingNumber: string;
  shipmentType: string;
  shipmentDate: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: string;
  deliveryOrderIds: string[];
  items: ShipmentItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface ShipmentItem {
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  weight: number;
  volume: number;
  batchNumber?: string;
  notes?: string;
}

export interface Carrier {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  status: string;
  supportedServices: string[];
  supportedRegions: string[];
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface Route {
  id?: string;
  _id?: string;
  routeName: string;
  warehouseId: string;
  warehouseName: string;
  stops: RouteStop[];
  totalDistance: number;
  estimatedDuration: number;
  fuelCost: number;
  laborCost: number;
  totalCost: number;
  status: string;
  plannedDate: string;
  startedAt?: string;
  completedAt?: string;
  assignedDriver?: string;
  assignedVehicle?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface RouteStop {
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  sequence: number;
  estimatedArrival?: string;
  actualArrival?: string;
  estimatedDeparture?: string;
  actualDeparture?: string;
  status: string;
  notes?: string;
}