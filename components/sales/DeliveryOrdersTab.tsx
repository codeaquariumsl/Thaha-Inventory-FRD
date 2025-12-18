'use client';

import Modal from '@/components/Modal';
import { useState, useMemo } from 'react';
import { Plus, Search, Eye, Truck, CheckCircle, Trash2, FileText, CheckSquare } from 'lucide-react';
import { deliveryOrders as initialDeliveries, customers, salesOrders, salesInvoices } from '@/data/salesData';
import { products } from '@/data/mockData';
import { DeliveryOrder, EnhancedSaleItem, SalesInvoice } from '@/types';

export default function DeliveryOrdersTab() {
    const [deliveries, setDeliveries] = useState(initialDeliveries);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingDelivery, setViewingDelivery] = useState<DeliveryOrder | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state for creating delivery order
    const [formData, setFormData] = useState({
        customerId: '',
        salesOrderId: '',
        deliveryAddress: '',
        deliveryDate: '',
        trackingNumber: '',
        notes: '',
    });

    const [deliveryItems, setDeliveryItems] = useState<EnhancedSaleItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');

    const filteredDeliveries = useMemo(() => {
        return deliveries.filter(delivery => {
            const matchesSearch = delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [deliveries, searchTerm, statusFilter]);

    const handleOpenCreateModal = () => {
        setFormData({
            customerId: '',
            salesOrderId: '',
            deliveryAddress: '',
            deliveryDate: '',
            trackingNumber: '',
            notes: '',
        });
        setDeliveryItems([]);
        setIsCreateModalOpen(true);
    };

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setFormData({
                ...formData,
                customerId,
                deliveryAddress: `${customer.address}, ${customer.city}, ${customer.country}`,
                salesOrderId: '',
            });
            setDeliveryItems([]);
        }
    };

    const handleSalesOrderChange = (salesOrderId: string) => {
        const order = salesOrders.find(o => o.id === salesOrderId);
        if (order) {
            setFormData({ ...formData, salesOrderId });
            setDeliveryItems(order.items);
        } else {
            setFormData({ ...formData, salesOrderId: '' });
            setDeliveryItems([]);
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct || !quantity) return;

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        // Get customer-specific price if available
        const customer = customers.find(c => c.id === formData.customerId);
        const itemPrice = customer?.customerPrices?.[product.id] ?? product.price;

        const qty = parseInt(quantity);

        setDeliveryItems([...deliveryItems, {
            productId: product.id,
            productName: product.name,
            uom: product.uom,
            quantity: qty,
            price: itemPrice,
            discount: 0,
            tax: 0,
            total: qty * itemPrice,
        }]);

        setSelectedProduct('');
        setQuantity('1');
    };

    const handleRemoveItem = (productId: string) => {
        setDeliveryItems(deliveryItems.filter(item => item.productId !== productId));
    };

    const handleUpdateItemQuantity = (productId: string, newQuantity: number) => {
        setDeliveryItems(deliveryItems.map(item => {
            if (item.productId === productId) {
                const subtotal = newQuantity * item.price;
                const total = subtotal - item.discount + item.tax;
                return { ...item, quantity: newQuantity, total };
            }
            return item;
        }));
    };

    const handleUpdateItemDiscount = (productId: string, newDiscount: number) => {
        setDeliveryItems(deliveryItems.map(item => {
            if (item.productId === productId) {
                const subtotal = item.quantity * item.price;
                const total = subtotal - newDiscount + item.tax;
                return { ...item, discount: newDiscount, total };
            }
            return item;
        }));
    };

    const handleUpdateItemTax = (productId: string, newTax: number) => {
        setDeliveryItems(deliveryItems.map(item => {
            if (item.productId === productId) {
                const subtotal = item.quantity * item.price;
                const total = subtotal - item.discount + newTax;
                return { ...item, tax: newTax, total };
            }
            return item;
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (deliveryItems.length === 0) {
            alert('Please add at least one item to the delivery');
            return;
        }

        const customer = customers.find(c => c.id === formData.customerId);
        if (!customer) return;

        const salesOrder = formData.salesOrderId ? salesOrders.find(o => o.id === formData.salesOrderId) : undefined;

        const newDelivery: DeliveryOrder = {
            id: Date.now().toString(),
            deliveryNumber: `DO-2024-${String(deliveries.length + 1).padStart(3, '0')}`,
            salesOrderId: formData.salesOrderId || '',
            salesOrderNumber: salesOrder?.orderNumber || 'Direct Delivery',
            customerId: formData.customerId,
            customerName: customer.name,
            deliveryAddress: formData.deliveryAddress,
            items: deliveryItems,
            status: 'pending',
            deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
            trackingNumber: formData.trackingNumber || undefined,
            notes: formData.notes,
            createdAt: new Date(),
        };

        // Persist to mock data
        initialDeliveries.unshift(newDelivery);

        setDeliveries([newDelivery, ...deliveries]);
        setIsCreateModalOpen(false);
    };

    const handleMarkInTransit = (id: string) => {
        // Persist to mock data
        const delivery = initialDeliveries.find(d => d.id === id);
        if (delivery) delivery.status = 'in_transit';

        setDeliveries(deliveries.map(d =>
            d.id === id ? { ...d, status: 'in_transit' as const } : d
        ));
    };

    const handleMarkDelivered = (id: string) => {
        // Persist to mock data
        const delivery = initialDeliveries.find(d => d.id === id);
        if (delivery) {
            delivery.status = 'delivered';
            delivery.deliveredDate = new Date();
        }

        setDeliveries(deliveries.map(d =>
            d.id === id ? { ...d, status: 'delivered' as const, deliveredDate: new Date() } : d
        ));
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this delivery order?')) {
            // Persist to mock data
            const index = initialDeliveries.findIndex(d => d.id === id);
            if (index > -1) initialDeliveries.splice(index, 1);

            setDeliveries(deliveries.filter(d => d.id !== id));
        }
    };

    const handleApprove = (id: string) => {
        const delivery = deliveries.find(d => d.id === id);
        if (!delivery) return;

        // Calculate invoice totals
        const subtotal = delivery.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const totalDiscount = delivery.items.reduce((sum, item) => sum + item.discount, 0);
        const tax = delivery.items.reduce((sum, item) => sum + item.tax, 0);
        const total = subtotal - totalDiscount + tax;

        // Create new invoice automatically
        const newInvoice: SalesInvoice = {
            id: Date.now().toString(),
            invoiceNumber: `INV-${new Date().getFullYear()}-${String(salesInvoices.length + 1).padStart(3, '0')}`,
            salesOrderId: delivery.salesOrderId,
            customerId: delivery.customerId,
            customerName: delivery.customerName,
            items: delivery.items,
            subtotal,
            tax,
            discount: totalDiscount,
            total,
            amountPaid: 0,
            amountDue: total,
            status: 'sent', // Automatically approved/sent
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default Net 30
            paymentTerms: 'Net 30',
            notes: `Generated automatically from Approved Delivery Order ${delivery.deliveryNumber}`,
            createdAt: new Date(),
        };

        // Add to global mock data so it appears in SalesInvoicesTab
        salesInvoices.unshift(newInvoice);

        // Update global mock data for delivery status
        const globalDelivery = initialDeliveries.find(d => d.id === id);
        if (globalDelivery) globalDelivery.status = 'approved';

        // Update delivery status
        setDeliveries(deliveries.map(d =>
            d.id === id ? { ...d, status: 'approved' as const } : d
        ));

        alert(`Delivery Order Approved successfully!\nInvoice ${newInvoice.invoiceNumber} has been generated automatically.`);
        console.log("Created Invoice:", newInvoice);
    };

    const customerOrders = formData.customerId
        ? salesOrders.filter(o => o.customerId === formData.customerId && o.status === 'confirmed')
        : [];

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-primary">Delivery Orders</h2>
                    <p className="text-theme-secondary">Track and manage product deliveries</p>
                </div>
                <button onClick={handleOpenCreateModal} className="btn-primary flex items-center gap-2 w-fit">
                    <Plus className="w-5 h-5" />
                    New Delivery Order
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Deliveries</p>
                    <p className="text-2xl font-bold text-theme-primary">{deliveries.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{deliveries.filter(d => d.status === 'pending').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">In Transit</p>
                    <p className="text-2xl font-bold text-blue-400">{deliveries.filter(d => d.status === 'in_transit').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">Delivered</p>
                    <p className="text-2xl font-bold text-green-400">{deliveries.filter(d => d.status === 'delivered').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                        <input
                            type="text"
                            placeholder="Search deliveries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Deliveries Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Delivery Number</th>
                            <th>Sales Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Delivery Date</th>
                            <th>Tracking Number</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDeliveries.map((delivery) => (
                            <tr key={delivery.id}>
                                <td className="font-semibold">{delivery.deliveryNumber}</td>
                                <td>{delivery.salesOrderNumber}</td>
                                <td>{delivery.customerName}</td>
                                <td>{delivery.items.length} items</td>
                                <td>{delivery.deliveryDate ? delivery.deliveryDate.toLocaleDateString() : '-'}</td>
                                <td>{delivery.trackingNumber || '-'}</td>
                                <td>
                                    <span className={`badge ${delivery.status === 'delivered' ? 'badge-success' :
                                        delivery.status === 'in_transit' ? 'badge-info' :
                                            delivery.status === 'approved' ? 'badge-success' :
                                                delivery.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {delivery.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setViewingDelivery(delivery); setIsViewModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View">
                                            <Eye className="w-4 h-4 text-primary-400" />
                                        </button>
                                        {delivery.status === 'pending' && (
                                            <button onClick={() => handleApprove(delivery.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Approve">
                                                <CheckSquare className="w-4 h-4 text-green-400" />
                                            </button>
                                        )}
                                        {delivery.status === 'approved' && (
                                            <>
                                                <button onClick={() => handleMarkInTransit(delivery.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Mark In Transit">
                                                    <Truck className="w-4 h-4 text-blue-400" />
                                                </button>
                                            </>
                                        )}
                                        {delivery.status === 'in_transit' && (
                                            <button onClick={() => handleMarkDelivered(delivery.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Mark Delivered">
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(delivery.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Delivery Order Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Delivery Order">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Customer *</label>
                            <select
                                required
                                value={formData.customerId}
                                onChange={(e) => handleCustomerChange(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select Customer</option>
                                {customers.filter(c => c.status === 'active').map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Sales Order (Optional)</label>
                            <select
                                value={formData.salesOrderId}
                                onChange={(e) => handleSalesOrderChange(e.target.value)}
                                className="input-field"
                                disabled={!formData.customerId}
                            >
                                <option value="">Direct Delivery (No Order)</option>
                                {customerOrders.map(order => (
                                    <option key={order.id} value={order.id}>
                                        {order.orderNumber} - {order.items.length} items
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Delivery Address *</label>
                            <input
                                type="text"
                                required
                                value={formData.deliveryAddress}
                                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                className="input-field"
                                placeholder="Full delivery address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Delivery Date</label>
                            <input
                                type="date"
                                value={formData.deliveryDate}
                                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Tracking Number</label>
                            <input
                                type="text"
                                value={formData.trackingNumber}
                                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                                className="input-field"
                                placeholder="TRK123456789"
                            />
                        </div>
                    </div>

                    {/* Add Items (only if not from sales order) */}
                    {!formData.salesOrderId && (
                        <div className="border-t border-white/10 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-theme-primary">Add Items</h3>
                                {formData.customerId && (
                                    <p className="text-sm text-blue-400">
                                        💡 Customer-specific prices will be applied automatically
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="input-field"
                                        disabled={!formData.customerId}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(product => {
                                            const customer = customers.find(c => c.id === formData.customerId);
                                            const customerPrice = customer?.customerPrices?.[product.id];
                                            const hasCustomPrice = customerPrice !== undefined;

                                            return (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} - {hasCustomPrice
                                                        ? `$${customerPrice.toFixed(2)} (Special Price, Reg: $${product.price.toFixed(2)})`
                                                        : `$${product.price.toFixed(2)}`} | Stock: {product.stock} {product.uom}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="input-field"
                                        placeholder="Qty"
                                    />
                                    <button type="button" onClick={handleAddItem} className="btn-secondary whitespace-nowrap">
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Items Table */}
                    {deliveryItems.length > 0 && (
                        <div className="border-t border-white/10 pt-6 mb-4">
                            <h3 className="text-lg font-semibold text-theme-primary mb-4">Delivery Items</h3>
                            <div className="table-container">
                                <table className="data-table min-w-[1000px]">
                                    <thead>
                                        <tr>
                                            <th className="text-left">Item Name</th>
                                            <th className="text-center">UOM</th>
                                            <th className="text-center">Quantity</th>
                                            <th className="text-right">Unit Price</th>
                                            <th className="text-right">Discount</th>
                                            <th className="text-right">Tax</th>
                                            <th className="text-right">Total</th>
                                            {!formData.salesOrderId && <th className="text-center">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryItems.map((item, index) => (
                                            <tr key={item.productId}>
                                                <td className="font-semibold text-left text-theme-primary">{item.productName}</td>
                                                <td className="text-center text-theme-secondary">{item.uom}</td>
                                                <td className="text-center">
                                                    {!formData.salesOrderId ? (
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleUpdateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                            className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-theme-primary text-center focus:outline-none focus:border-primary-500"
                                                        />
                                                    ) : (
                                                        <span className="text-theme-primary">{item.quantity}</span>
                                                    )}
                                                </td>
                                                <td className="text-right text-theme-secondary">${item.price.toFixed(2)}</td>
                                                <td className="text-right">
                                                    {!formData.salesOrderId ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.discount}
                                                            onChange={(e) => handleUpdateItemDiscount(item.productId, parseFloat(e.target.value) || 0)}
                                                            className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-theme-primary text-right focus:outline-none focus:border-primary-500"
                                                        />
                                                    ) : (
                                                        <span className="text-theme-secondary">${item.discount.toFixed(2)}</span>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    {!formData.salesOrderId ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.tax}
                                                            onChange={(e) => handleUpdateItemTax(item.productId, parseFloat(e.target.value) || 0)}
                                                            className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-theme-primary text-right focus:outline-none focus:border-primary-500"
                                                        />
                                                    ) : (
                                                        <span className="text-theme-secondary">${item.tax.toFixed(2)}</span>
                                                    )}
                                                </td>
                                                <td className="font-bold text-right text-theme-primary">${item.total.toFixed(2)}</td>
                                                {!formData.salesOrderId && (
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.productId)}
                                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                            title="Remove Item"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-white/10">
                                            <td colSpan={6} className="text-right font-semibold py-2 text-theme-secondary">
                                                Subtotal:
                                            </td>
                                            <td className="font-semibold py-2 text-right text-theme-primary">
                                                ${deliveryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                                            </td>
                                            {!formData.salesOrderId && <td></td>}
                                        </tr>
                                        <tr>
                                            <td colSpan={6} className="text-right font-semibold py-2 text-theme-secondary">
                                                Total Discount:
                                            </td>
                                            <td className="font-semibold text-yellow-400 py-2 text-right">
                                                -${deliveryItems.reduce((sum, item) => sum + item.discount, 0).toFixed(2)}
                                            </td>
                                            {!formData.salesOrderId && <td></td>}
                                        </tr>
                                        <tr>
                                            <td colSpan={6} className="text-right font-semibold py-2 text-theme-secondary">
                                                Total Tax:
                                            </td>
                                            <td className="font-semibold text-blue-400 py-2 text-right">
                                                +${deliveryItems.reduce((sum, item) => sum + item.tax, 0).toFixed(2)}
                                            </td>
                                            {!formData.salesOrderId && <td></td>}
                                        </tr>
                                        <tr className="border-t-2 border-white/20">
                                            <td colSpan={6} className="text-right font-bold text-lg py-3 text-theme-primary">
                                                Grand Total:
                                            </td>
                                            <td className="font-bold text-lg text-primary-400 py-3 text-right">
                                                ${deliveryItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                                            </td>
                                            {!formData.salesOrderId && <td></td>}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">Delivery Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="input-field"
                            rows={3}
                            placeholder="Special delivery instructions..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="btn-primary flex-1">Create Delivery Order</button>
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-outline flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Delivery Order Details">
                {viewingDelivery && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-theme-secondary">Delivery Number</p>
                                <p className="font-semibold text-theme-primary">{viewingDelivery.deliveryNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Sales Order</p>
                                <p className="font-semibold text-theme-primary">{viewingDelivery.salesOrderNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Customer</p>
                                <p className="font-semibold text-theme-primary">{viewingDelivery.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Status</p>
                                <span className={`badge ${viewingDelivery.status === 'delivered' ? 'badge-success' :
                                    viewingDelivery.status === 'in_transit' ? 'badge-info' :
                                        viewingDelivery.status === 'approved' ? 'badge-success' :
                                            viewingDelivery.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {viewingDelivery.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-theme-secondary">Delivery Address</p>
                                <p className="font-semibold text-theme-primary">{viewingDelivery.deliveryAddress}</p>
                            </div>
                            {viewingDelivery.trackingNumber && (
                                <div>
                                    <p className="text-sm text-theme-secondary">Tracking Number</p>
                                    <p className="font-semibold text-theme-primary">{viewingDelivery.trackingNumber}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-theme-secondary">Delivery Date</p>
                                <p className="font-semibold text-theme-primary">{viewingDelivery.deliveryDate ? viewingDelivery.deliveryDate.toLocaleDateString() : '-'}</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-semibold text-theme-primary mb-4">Items</h3>
                            <div className="space-y-2">
                                {viewingDelivery.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="font-medium text-theme-primary">{item.productName}</p>
                                            <p className="text-sm text-theme-secondary">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {viewingDelivery.notes && (
                            <div>
                                <p className="text-sm text-theme-secondary mb-2">Notes</p>
                                <p className="text-theme-primary">{viewingDelivery.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
