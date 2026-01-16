// Product Types
export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    categoryId?: string; // FK to Category
    type: 'raw_material' | 'finished_good';
    description: string;
    price: number;
    cost: number;
    stock: number;
    reorderLevel: number;
    supplier: string;
    uom: string; // Unit of Measurement (e.g., 'pcs', 'kg', 'ltr', 'box')
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Sales Types
export interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Sale {
    id: string;
    saleNumber: string;
    customer: string;
    customerEmail?: string;
    items: SaleItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod: 'cash' | 'card' | 'online';
    createdAt: Date;
    completedAt?: Date;
}

// Purchase Types
export interface PurchaseItem {
    productId: string;
    productName: string;
    quantity: number;
    cost: number;
    total: number;
}

export interface Purchase {
    id: string;
    purchaseNumber: string;
    supplier: string;
    supplierEmail?: string;
    items: PurchaseItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'received' | 'cancelled';
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    createdAt: Date;
    receivedAt?: Date;
}

// Stock Movement Types
export interface StockMovement {
    id: string;
    productId: string;
    productName: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reference: string;
    reason: string;
    createdAt: Date;
    createdBy: string;
}

// Dashboard Stats
export interface DashboardStats {
    totalRevenue: number;
    totalSales: number;
    totalPurchases: number;
    lowStockItems: number;
    revenueChange: number;
    salesChange: number;
    purchasesChange: number;
    stockChange: number;
}

// Category Type
export interface Category {
    id: string;
    name: string;
    description: string;
}

// Supplier Type
export interface Supplier {
    id: string;
    name: string;
    contactPerson?: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    country?: string;
    createdAt?: Date;
}

// Customer Types
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    taxId?: string;
    creditLimit: number;
    balance: number;
    status: 'active' | 'inactive';
    customerPrices?: { [productId: string]: number }; // Customer-specific pricing
    createdAt: Date;
}

// Enhanced Sale Item with discount and tax
export interface EnhancedSaleItem {
    productId: string;
    productName: string;
    uom: string; // Unit of Measurement
    quantity: number;
    price: number;
    discount: number;
    tax: number;
    total: number;
}

// Sales Order Types
export interface SalesOrder {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    Customer?: Customer;
    items: EnhancedSaleItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: 'Draft' | 'Confirmed' | 'Processing' | 'Completed' | 'Cancelled';
    deliveryDate?: Date;
    notes?: string;
    orderType: 'General' | 'Tax';
    createdAt: Date;
    updatedAt: Date;
}

// Delivery Order Types
export interface DeliveryOrder {
    id: string;
    deliveryNumber: string;
    salesOrderId: string;
    salesOrderNumber: string;
    customerId: string;
    customerName: string;
    Customer?: Customer;
    deliveryAddress: string;
    items: EnhancedSaleItem[];
    status: 'Pending' | 'Approved' | 'In Transit' | 'Delivered' | 'Cancelled';
    deliveryDate?: Date;
    deliveredDate?: Date;
    trackingNumber?: string;
    notes?: string;
    orderType: 'General' | 'Tax';
    createdAt: Date;
}

// Sales Invoice Types
export interface SalesInvoice {
    id: string;
    invoiceNumber: string;
    salesOrderId?: string;
    customerId: string;
    customerName: string;
    customerEmail?: string;
    Customer?: Customer;
    items: EnhancedSaleItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    status: 'Draft' | 'Approved' | 'Sent' | 'Paid' | 'Partial' | 'Overdue' | 'Cancelled';
    dueDate: Date;
    paidDate?: Date;
    paymentTerms: string;
    notes?: string;
    orderType: 'General' | 'Tax';
    createdAt: Date;
}

// Sales Return Types
export interface SalesReturn {
    id: string;
    returnNumber: string;
    invoiceId?: string;
    invoiceNumber?: string;
    customerId: string;
    customerName: string;
    Customer?: Customer;
    items: EnhancedSaleItem[];
    subtotal: number;
    tax: number;
    total: number;
    refundAmount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    refundMethod: 'cash' | 'card' | 'credit_note';
    createdAt: Date;
    processedAt?: Date;
}

// Customer Receipt Types
export interface CustomerReceipt {
    id: string;
    receiptNumber: string;
    customerId: string;
    customerName: string;
    invoiceId?: string;
    invoiceNumber?: string;
    amount: number;
    paymentMethod: 'cash' | 'card' | 'online' | 'check' | 'bank_transfer';
    referenceNumber?: string;
    notes?: string;
    createdAt: Date;
}

// User and Role Types
export interface Role {
    id: string;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface User {
    id: string;
    username: string;
    email: string;
    password?: string;
    roleId?: string;
    Role?: Role;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
