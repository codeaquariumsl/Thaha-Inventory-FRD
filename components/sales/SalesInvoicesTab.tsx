'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Modal from '@/components/Modal';
import { Plus, Search, Eye, Send, DollarSign, CheckSquare, Printer } from 'lucide-react';
// import { salesInvoices as initialInvoices, customers, deliveryOrders } from '@/data/salesData';
// import { products } from '@/data/mockData';
import { SalesInvoice, EnhancedSaleItem, Customer, DeliveryOrder, Product } from '@/types';
import * as api from '@/lib/api';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export default function SalesInvoicesTab() {
    const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingInvoice, setViewingInvoice] = useState<SalesInvoice | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Data from API
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [user, setUser] = useState<any>(null);

    const canAccessTax = user?.role === 'admin' || user?.role === 'tax_user';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [invData, custData, doData, prodData] = await Promise.all([
                api.getInvoices(),
                api.getCustomers(),
                api.getDeliveryOrders(),
                api.getProducts()
            ]);

            setInvoices(invData.map((inv: any) => ({
                ...inv,
                id: inv.id.toString(),
                customerName: inv.Customer ? inv.Customer.name : (inv.customerName || 'Unknown'),
                subtotal: parseFloat(inv.subtotal) || 0,
                tax: parseFloat(inv.tax) || 0,
                discount: parseFloat(inv.discount) || 0,
                total: parseFloat(inv.total) || 0,
                amountPaid: parseFloat(inv.amountPaid) || 0,
                amountDue: parseFloat(inv.amountDue) || 0,
                invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate) : new Date(inv.createdAt),
                dueDate: new Date(inv.dueDate),
                createdAt: new Date(inv.createdAt),
                paidDate: inv.paidDate ? new Date(inv.paidDate) : undefined,
                items: inv.items ? inv.items.map((item: any) => ({
                    ...item,
                    Product: item.Product || { name: item.productName || 'Unknown', uom: item.uom || 'pcs' },
                    price: parseFloat(item.price) || 0,
                    quantity: parseInt(item.quantity) || 0,
                    discount: parseFloat(item.discount) || 0,
                    tax: parseFloat(item.tax) || 0,
                    total: parseFloat(item.total) || 0,
                })) : []
            })));
            setCustomers(custData.map((c: any) => ({ ...c, id: c.id.toString() })));
            setDeliveryOrders(doData.map((d: any) => ({ ...d, id: d.id.toString(), customerId: d.customerId.toString() })));
            setProducts(prodData.map((p: any) => ({ ...p, id: p.id.toString() })));
        } catch (error) {
            console.error("Failed to load invoice data", error);
        }
    };

    const [formData, setFormData] = useState({
        customerId: '',
        deliveryOrderId: '',
        dueDate: '',
        paymentTerms: 'Net 30',
        notes: '',
        orderType: 'General' as 'General' | 'Tax',
    });

    const [invoiceItems, setInvoiceItems] = useState<EnhancedSaleItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [discount, setDiscount] = useState('0');

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    // Available delivery orders for the selected customer
    const availableDeliveryOrders = useMemo(() => {
        return formData.customerId
            ? deliveryOrders.filter(d =>
                d.customerId === formData.customerId &&
                (d.status.toLowerCase() === 'approved' || d.status.toLowerCase() === 'delivered' || d.status.toLowerCase() === 'in transit' || d.status.toLowerCase() === 'in_transit')
            )
            : [];
    }, [formData.customerId, deliveryOrders]);

    const handleDeliveryOrderChange = (deliveryOrderId: string) => {
        const delivery = deliveryOrders.find(d => d.id === deliveryOrderId);
        if (delivery) {
            setFormData({
                ...formData,
                deliveryOrderId,
                notes: `Generated from Delivery Order ${delivery.deliveryNumber}`,
                orderType: delivery.orderType || 'General' // Inherit from delivery order
            });
            // We need to map delivery items to invoice items (EnhancedSaleItem)
            // Assuming delivery items have productId, quantity. Price might need to be fetched from products or sales order if available.
            // Since delivery items structure might differ, let's map it safely.
            const mappedItems = delivery.items.map(di => {
                const product = products.find(p => p.id === di.productId);
                return {
                    productId: di.productId,
                    productName: product?.name || 'Unknown Product',
                    uom: product?.uom || 'pcs',
                    quantity: di.quantity,
                    price: product?.price || 0, // In a real app, this should come from the Sales Order
                    discount: 0,
                    tax: 0,
                    total: (di.quantity * (product?.price || 0)) // Recalculate based on current price
                };
            });
            // Re-calculate totals for these items:
            const itemsWithTotals = mappedItems.map(item => {
                const sub = item.quantity * item.price;
                const ax = sub * 0.1;
                return { ...item, tax: ax, total: sub + ax };
            });
            setInvoiceItems(itemsWithTotals);
        } else {
            setFormData({
                ...formData,
                deliveryOrderId: '',
                notes: '',
                orderType: 'General'
            });
            setInvoiceItems([]);
        }
    };

    const calculateTotals = () => {
        const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const totalDiscount = invoiceItems.reduce((sum, item) => sum + item.discount, 0);
        const tax = (subtotal - totalDiscount) * 0.1;
        const total = subtotal - totalDiscount + tax;
        return { subtotal, tax, totalDiscount, total };
    };

    const handleAddItem = () => {
        if (!selectedProduct || !quantity) return;

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const qty = parseInt(quantity);
        const disc = parseFloat(discount) || 0;
        const itemSubtotal = qty * product.price;
        const itemTax = (itemSubtotal - disc) * 0.1;
        const itemTotal = itemSubtotal - disc + itemTax;

        setInvoiceItems([...invoiceItems, {
            productId: product.id,
            productName: product.name,
            uom: product.uom || 'pcs',
            quantity: qty,
            price: product.price,
            discount: disc,
            tax: itemTax,
            total: itemTotal,
        }]);

        setSelectedProduct('');
        setQuantity('1');
        setDiscount('0');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (invoiceItems.length === 0) {
            alert('Please add at least one item to the invoice');
            return;
        }

        const customer = customers.find(c => c.id === formData.customerId);
        if (!customer) return;

        const deliveryOrder = deliveryOrders.find(d => d.id === formData.deliveryOrderId);
        // Note: In a real app, we might want to link the invoice to a Sales Order ID if available
        // salesOrderId is optional in the interface, check if delivery order has it.
        const salesOrderId = deliveryOrder?.salesOrderId || undefined;

        const { subtotal, tax, totalDiscount, total } = calculateTotals();

        const payload = {
            customerId: formData.customerId,
            salesOrderId: salesOrderId,
            items: invoiceItems,
            subtotal,
            tax,
            discount: totalDiscount,
            total,
            amountPaid: 0,
            amountDue: total,
            status: 'Draft',
            dueDate: formData.dueDate,
            paymentTerms: formData.paymentTerms,
            notes: formData.notes,
            orderType: formData.orderType
        };

        try {
            await api.createInvoice(payload);
            loadData();
            setIsCreateModalOpen(false);
            setInvoiceItems([]);
            setFormData({ ...formData, customerId: '', deliveryOrderId: '', notes: '', orderType: 'General' });
        } catch (error: any) {
            alert('Failed to create invoice: ' + error.message);
        }
    };

    const handleMarkPaid = async (id: string) => {
        const invoice = invoices.find(i => i.id === id);
        if (!invoice) return;

        try {
            await api.updateInvoice(id, {
                status: 'Paid',
                amountPaid: invoice.total,
                amountDue: 0,
                paidDate: new Date()
            });
            loadData();
        } catch (error: any) {
            alert('Failed to mark as paid: ' + error.message);
        }
    };

    const handleSendInvoice = async (id: string) => {
        try {
            await api.updateInvoice(id, { status: 'Sent' });
            loadData();
        } catch (error: any) {
            alert('Failed to send invoice: ' + error.message);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.approveInvoice(id);
            loadData();
        } catch (error: any) {
            alert('Failed to approve invoice: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            try {
                await api.deleteInvoice(id);
                loadData();
            } catch (error: any) {
                alert('Failed to delete invoice: ' + error.message);
            }
        }
    };

    const handlePrintInvoice = async (id: string) => {
        const invoice = invoices.find(i => i.id === id);
        if (invoice) {
            await generateInvoicePDF(invoice);
        }
    };

    const totals = calculateTotals();

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-primary">Sales Invoices</h2>
                    <p className="text-theme-secondary">Create and manage customer invoices</p>
                </div>
                <button onClick={() => {
                    setFormData({
                        customerId: '',
                        deliveryOrderId: '',
                        dueDate: '',
                        paymentTerms: 'Net 30',
                        notes: '',
                        orderType: 'General'
                    });
                    setInvoiceItems([]);
                    setIsCreateModalOpen(true);
                }} className="btn-primary flex items-center gap-2 w-fit">
                    <Plus className="w-5 h-5" />
                    New Invoice
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Invoices</p>
                    <p className="text-2xl font-bold text-theme-primary">{invoices.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Paid</p>
                    <p className="text-2xl font-bold text-green-400">{invoices.filter(i => i.status === 'Paid').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{invoices.filter(i => i.status === 'Sent' || i.status === 'Partial').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Overdue</p>
                    <p className="text-2xl font-bold text-red-400">{invoices.filter(i => i.status === 'Overdue').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Due</p>
                    <p className="text-2xl font-bold text-theme-primary">LKR {invoices.reduce((sum, i) => sum + i.amountDue, 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                        <input type="text" placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                        <option value="all">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Approved">Approved</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Invoice Number</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Due</th>
                            <th>Due Date</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td className="font-semibold">{invoice.invoiceNumber}</td>
                                <td>{invoice.customerName}</td>
                                <td className="font-bold">LKR {invoice.total.toFixed(2)}</td>
                                <td className="text-green-400">LKR {invoice.amountPaid.toFixed(2)}</td>
                                <td className="text-red-400">LKR {invoice.amountDue.toFixed(2)}</td>
                                <td>{invoice.dueDate.toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${invoice.orderType === 'Tax' ? 'badge-accent' : 'badge-info'}`}>
                                        {invoice.orderType}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${invoice.status === 'Paid' ? 'badge-success' :
                                        invoice.status === 'Partial' ? 'badge-info' :
                                            invoice.status === 'Sent' ? 'badge-warning' :
                                                invoice.status === 'Approved' ? 'badge-success' :
                                                    invoice.status === 'Overdue' ? 'badge-danger' : 'badge-warning'
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setViewingInvoice(invoice); setIsViewModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View">
                                            <Eye className="w-4 h-4 text-primary-400" />
                                        </button>
                                        {invoice.status === 'Approved' && (
                                            <button onClick={() => handlePrintInvoice(invoice.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Print Invoice">
                                                <Printer className="w-4 h-4 text-blue-400" />
                                            </button>
                                        )}
                                        {/* {invoice.status === 'Draft' && (
                                            <>
                                                <button onClick={() => handleApprove(invoice.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Approve">
                                                    <CheckSquare className="w-4 h-4 text-green-400" />
                                                </button>
                                            </>
                                        )}
                                        {invoice.status === 'Approved' && (
                                            <button onClick={() => handleSendInvoice(invoice.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Send">
                                                <Send className="w-4 h-4 text-blue-400" />
                                            </button>
                                        )}
                                        {(invoice.status === 'Sent' || invoice.status === 'Partial') && (
                                            <button onClick={() => handleMarkPaid(invoice.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Mark Paid">
                                                <DollarSign className="w-4 h-4 text-green-400" />
                                            </button>
                                        )} */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Sales Invoice">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Customer *</label>
                            <select
                                required
                                value={formData.customerId}
                                onChange={(e) => {
                                    setFormData({ ...formData, customerId: e.target.value, deliveryOrderId: '' });
                                    setInvoiceItems([]);
                                }}
                                className="input-field"
                            >
                                <option value="">Select Customer</option>
                                {customers.filter(c => c.status === 'active').map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Delivery Order (Optional)</label>
                            <select
                                value={formData.deliveryOrderId}
                                onChange={(e) => handleDeliveryOrderChange(e.target.value)}
                                className="input-field"
                                disabled={!formData.customerId}
                            >
                                <option value="">Select Delivery Order</option>
                                {availableDeliveryOrders.map(delivery => (
                                    <option key={delivery.id} value={delivery.id}>
                                        {delivery.deliveryNumber} - {delivery.deliveryDate?.toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Due Date *</label>
                            <input type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Payment Terms *</label>
                            <select required value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} className="input-field">
                                <option value="Net 7">Net 7</option>
                                <option value="Net 10">Net 10</option>
                                <option value="Net 15">Net 15</option>
                                <option value="Net 30">Net 30</option>
                                <option value="Net 60">Net 60</option>
                                <option value="Due on Receipt">Due on Receipt</option>
                            </select>
                        </div>
                        {canAccessTax && (
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Invoice Type</label>
                                <select
                                    value={formData.orderType}
                                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value as 'General' | 'Tax' })}
                                    className="input-field"
                                    disabled={!!formData.deliveryOrderId} // Disable if inherited from Delivery Order
                                >
                                    <option value="General">General</option>
                                    <option value="Tax">Tax</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-theme-primary mb-4">Add Items</h3>
                        {!formData.deliveryOrderId && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input-field">
                                        <option value="">Select Product</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name} - LKR {product.price}</option>
                                        ))}
                                    </select>
                                </div>
                                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" placeholder="Qty" />
                                <input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input-field" placeholder="Discount" />
                                <button type="button" onClick={handleAddItem} className="btn-secondary h-full">Add</button>
                            </div>
                        )}

                        {formData.deliveryOrderId && (
                            <p className="text-sm text-blue-400 mb-4">
                                💡 Items populated from Delivery Order {formData.deliveryOrderId && deliveryOrders.find(d => d.id === formData.deliveryOrderId)?.deliveryNumber}
                            </p>
                        )}

                        {invoiceItems.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {invoiceItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-theme-primary">{item.productName}</p>
                                            <p className="text-sm text-theme-secondary">{item.quantity} × LKR {item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-theme-primary">LKR {item.total.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">Notes</label>
                        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" rows={3} />
                    </div>

                    {invoiceItems.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-theme-secondary">
                                <span>Subtotal:</span>
                                <span>LKR {totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Discount:</span>
                                <span>-LKR {totals.totalDiscount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Tax (10%):</span>
                                <span>LKR {totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-theme-primary border-t border-white/10 pt-2">
                                <span>Total:</span>
                                <span>LKR {totals.total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="btn-primary flex-1">Create Invoice</button>
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-outline flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Invoice Details">
                {viewingInvoice && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-theme-secondary">Invoice Number</p>
                                <p className="font-semibold text-theme-primary">{viewingInvoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Customer</p>
                                <p className="font-semibold text-theme-primary">{viewingInvoice.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Due Date</p>
                                <p className="font-semibold text-theme-primary">{viewingInvoice.dueDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Payment Terms</p>
                                <p className="font-semibold text-theme-primary">{viewingInvoice.paymentTerms}</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-semibold text-theme-primary mb-4">Items</h3>
                            <div className="space-y-2">
                                {viewingInvoice.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="font-medium text-theme-primary">{item.productName}</p>
                                            <p className="text-sm text-theme-secondary">{item.quantity} × LKR {item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-theme-primary">LKR {item.total.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-theme-secondary">
                                <span>Subtotal:</span>
                                <span>LKR {viewingInvoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Discount:</span>
                                <span>-LKR {viewingInvoice.discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Tax:</span>
                                <span>LKR {viewingInvoice.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-theme-primary border-t border-white/10 pt-2">
                                <span>Total:</span>
                                <span>LKR {viewingInvoice.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-400 border-t border-white/10 pt-2">
                                <span>Amount Paid:</span>
                                <span>LKR {viewingInvoice.amountPaid.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-400">
                                <span>Amount Due:</span>
                                <span>LKR {viewingInvoice.amountDue.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                <span className="text-sm text-theme-secondary">Status</span>
                                <span className={`badge ${viewingInvoice.status === 'Paid' ? 'badge-success' :
                                    viewingInvoice.status === 'Partial' ? 'badge-info' :
                                        viewingInvoice.status === 'Sent' ? 'badge-warning' :
                                            viewingInvoice.status === 'Approved' ? 'badge-success' :
                                                viewingInvoice.status === 'Overdue' ? 'badge-danger' : 'badge-warning'
                                    }`}>
                                    {viewingInvoice.status}
                                </span>
                            </div>

                            <div className="flex gap-4">
                                {viewingInvoice.status === 'Draft' && (
                                    <button
                                        onClick={() => { handleApprove(viewingInvoice.id); setIsViewModalOpen(false); }}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        <CheckSquare className="w-5 h-5" />
                                        Approve Invoice
                                    </button>
                                )}
                                {viewingInvoice.status === 'Approved' && (
                                    <>
                                        <button
                                            onClick={() => { handleSendInvoice(viewingInvoice.id); setIsViewModalOpen(false); }}
                                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-5 h-5" />
                                            Send Invoice
                                        </button>
                                        <button
                                            onClick={() => { handlePrintInvoice(viewingInvoice.id); }}
                                            className="btn-secondary flex-1 flex items-center justify-center gap-2"
                                        >
                                            <Printer className="w-5 h-5" />
                                            Print PDF
                                        </button>
                                    </>
                                )}
                                {(viewingInvoice.status === 'Sent' || viewingInvoice.status === 'Partial') && (
                                    <button
                                        onClick={() => { handleMarkPaid(viewingInvoice.id); setIsViewModalOpen(false); }}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        <DollarSign className="w-5 h-5" />
                                        Mark Paid
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="btn-outline flex-1"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
