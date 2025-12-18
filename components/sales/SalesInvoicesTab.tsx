'use client';

import Modal from '@/components/Modal';
import { useState, useMemo } from 'react';
import { Plus, Search, Eye, Send, DollarSign } from 'lucide-react';
import { salesInvoices as initialInvoices, customers, deliveryOrders } from '@/data/salesData';
import { products } from '@/data/mockData';
import { SalesInvoice, EnhancedSaleItem } from '@/types';

export default function SalesInvoicesTab() {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingInvoice, setViewingInvoice] = useState<SalesInvoice | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        customerId: '',
        deliveryOrderId: '',
        dueDate: '',
        paymentTerms: 'Net 30',
        notes: '',
    });

    const [invoiceItems, setInvoiceItems] = useState<EnhancedSaleItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [discount, setDiscount] = useState('0');

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    // Available delivery orders for the selected customer
    const availableDeliveryOrders = useMemo(() => {
        return formData.customerId
            ? deliveryOrders.filter(d =>
                d.customerId === formData.customerId &&
                (d.status === 'approved' || d.status === 'delivered' || d.status === 'in_transit')
            )
            : [];
    }, [formData.customerId]);

    const handleDeliveryOrderChange = (deliveryOrderId: string) => {
        const delivery = deliveryOrders.find(d => d.id === deliveryOrderId);
        if (delivery) {
            setFormData({
                ...formData,
                deliveryOrderId,
                notes: `Generated from Delivery Order ${delivery.deliveryNumber}`
            });
            setInvoiceItems(delivery.items);
        } else {
            setFormData({
                ...formData,
                deliveryOrderId: '',
                notes: ''
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (invoiceItems.length === 0) {
            alert('Please add at least one item to the invoice');
            return;
        }

        const customer = customers.find(c => c.id === formData.customerId);
        if (!customer) return;

        const deliveryOrder = deliveryOrders.find(d => d.id === formData.deliveryOrderId);
        const { subtotal, tax, totalDiscount, total } = calculateTotals();

        const newInvoice: SalesInvoice = {
            id: Date.now().toString(),
            invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
            customerId: formData.customerId,
            salesOrderId: deliveryOrder?.salesOrderId,
            customerName: customer.name,
            customerEmail: customer.email,
            items: invoiceItems,
            subtotal,
            tax,
            discount: totalDiscount,
            total,
            amountPaid: 0,
            amountDue: total,
            status: 'draft',
            dueDate: new Date(formData.dueDate),
            paymentTerms: formData.paymentTerms,
            notes: formData.notes,
            createdAt: new Date(),
        };

        setInvoices([newInvoice, ...invoices]);
        setIsCreateModalOpen(false);
        setInvoiceItems([]);
    };

    const handleMarkPaid = (id: string) => {
        setInvoices(invoices.map(inv =>
            inv.id === id ? { ...inv, status: 'paid' as const, amountPaid: inv.total, amountDue: 0, paidDate: new Date() } : inv
        ));
    };

    const handleSendInvoice = (id: string) => {
        setInvoices(invoices.map(inv =>
            inv.id === id ? { ...inv, status: 'sent' as const } : inv
        ));
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
                    <p className="text-2xl font-bold text-green-400">{invoices.filter(i => i.status === 'paid').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{invoices.filter(i => i.status === 'sent' || i.status === 'partial').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Overdue</p>
                    <p className="text-2xl font-bold text-red-400">{invoices.filter(i => i.status === 'overdue').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Due</p>
                    <p className="text-2xl font-bold text-theme-primary">${invoices.reduce((sum, i) => sum + i.amountDue, 0).toFixed(2)}</p>
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
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="overdue">Overdue</option>
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
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td className="font-semibold">{invoice.invoiceNumber}</td>
                                <td>{invoice.customerName}</td>
                                <td className="font-bold">${invoice.total.toFixed(2)}</td>
                                <td className="text-green-400">${invoice.amountPaid.toFixed(2)}</td>
                                <td className="text-red-400">${invoice.amountDue.toFixed(2)}</td>
                                <td>{invoice.dueDate.toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${invoice.status === 'paid' ? 'badge-success' :
                                        invoice.status === 'partial' ? 'badge-info' :
                                            invoice.status === 'sent' ? 'badge-warning' :
                                                invoice.status === 'overdue' ? 'badge-danger' : 'badge-warning'
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setViewingInvoice(invoice); setIsViewModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View">
                                            <Eye className="w-4 h-4 text-primary-400" />
                                        </button>
                                        {invoice.status === 'draft' && (
                                            <button onClick={() => handleSendInvoice(invoice.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Send">
                                                <Send className="w-4 h-4 text-blue-400" />
                                            </button>
                                        )}
                                        {(invoice.status === 'sent' || invoice.status === 'partial') && (
                                            <button onClick={() => handleMarkPaid(invoice.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Mark Paid">
                                                <DollarSign className="w-4 h-4 text-green-400" />
                                            </button>
                                        )}
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
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-theme-primary mb-4">Add Items</h3>
                        {!formData.deliveryOrderId && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input-field">
                                        <option value="">Select Product</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name} - ${product.price.toFixed(2)}</option>
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
                                            <p className="text-sm text-theme-secondary">{item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-theme-primary">${item.total.toFixed(2)}</p>
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
                                <span>${totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Discount:</span>
                                <span>-${totals.totalDiscount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Tax (10%):</span>
                                <span>${totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-theme-primary border-t border-white/10 pt-2">
                                <span>Total:</span>
                                <span>${totals.total.toFixed(2)}</span>
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
                                            <p className="text-sm text-theme-secondary">{item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-theme-primary">${item.total.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-theme-secondary">
                                <span>Subtotal:</span>
                                <span>${viewingInvoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Discount:</span>
                                <span>-${viewingInvoice.discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Tax:</span>
                                <span>${viewingInvoice.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-theme-primary border-t border-white/10 pt-2">
                                <span>Total:</span>
                                <span>${viewingInvoice.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-400 border-t border-white/10 pt-2">
                                <span>Amount Paid:</span>
                                <span>${viewingInvoice.amountPaid.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-400">
                                <span>Amount Due:</span>
                                <span>${viewingInvoice.amountDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
