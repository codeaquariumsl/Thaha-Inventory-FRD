'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Modal from '@/components/Modal';
import { Plus, Search, Eye, Truck, CheckCircle, Trash2, FileText, CheckSquare, Printer } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import { DeliveryOrder, EnhancedSaleItem, SalesInvoice, Customer, SalesOrder, Product, Color } from '@/types';
import * as api from '@/lib/api';
import { generateDeliveryOrderPDF } from '@/lib/pdf-generator';
// Remove mock data imports to avoid unused variable errors if we are deleting them later or simply comment them out if we might fallback
// import { deliveryOrders as initialDeliveries, customers, salesOrders, salesInvoices } from '@/data/salesData';
// import { products } from '@/data/mockData';

export default function DeliveryOrdersTab() {
    const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingDelivery, setViewingDelivery] = useState<DeliveryOrder | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Additional state for fetching other data
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Form state for creating delivery order
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        customerId: '',
        salesOrderId: '',
        deliveryAddress: '',
        deliveryDate: '',
        trackingNumber: '',
        notes: '',
        orderType: 'General' as 'General' | 'Tax',
    });

    const canAccessTax = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'tax_user';

    const [deliveryItems, setDeliveryItems] = useState<EnhancedSaleItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [selectedColor, setSelectedColor] = useState('');
    const [colorsList, setColorsList] = useState<Color[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [delData, custData, soData, prodData, colorsData] = await Promise.all([
                api.getDeliveryOrders(),
                api.getCustomers(),
                api.getSalesOrders(),
                api.getProducts(),
                api.getColors()
            ]);
            setColorsList(colorsData || []);

            setDeliveries(delData.map((d: any) => {
                const salesOrder = d.SalesOrder || {};
                const customer = salesOrder.Customer || {};

                return {
                    ...d,
                    id: d.id.toString(),
                    customerId: salesOrder.customerId ? salesOrder.customerId.toString() : '',
                    customerName: customer.name || 'Unknown',
                    salesOrderId: d.salesOrderId ? d.salesOrderId.toString() : '',
                    salesOrderNumber: salesOrder.orderNumber || '-',
                    deliveryAddress: d.shippingAddress || '',
                    items: (d.items || salesOrder.items || []).map((item: any) => {
                        const colorIdStr = item.colorId ? item.colorId.toString() : undefined;
                        const matchedColor = colorIdStr ? (colorsData || []).find((c: any) => c.id.toString() === colorIdStr) : null;
                        return {
                            ...item,
                            productId: item.productId ? item.productId.toString() : '',
                            productName: item.Product ? item.Product.name : (item.productName || 'Unknown'),
                            uom: item.Product ? item.Product.uom : (item.uom || 'pcs'),
                            price: parseFloat(item.price) || 0,
                            quantity: parseInt(item.quantity) || 0,
                            discount: parseFloat(item.discount) || 0,
                            tax: parseFloat(item.tax) || 0,
                            total: parseFloat(item.total) || 0,
                            colorId: colorIdStr,
                            colorName: matchedColor?.name || undefined,
                            isHaveLid: item.Product ? item.Product.isHaveLid : false
                        };
                    }),
                    deliveryDate: d.deliveryDate ? new Date(d.deliveryDate) : undefined,
                    createdAt: new Date(d.createdAt)
                };
            }));
            setCustomers(custData);
            setSalesOrders(soData);
            setProducts(prodData.map((p: any) => ({
                ...p,
                id: p.id.toString(),
                price: parseFloat(p.price) || 0,
                cost: parseFloat(p.cost) || 0,
                stock: parseInt(p.stockQuantity) || 0,
                reorderLevel: parseInt(p.reorderLevel) || 0,
                category: p.Category ? p.Category.name : 'Uncategorized',
                colors: p.Colors || p.colors || []
            })));
        } catch (error) {
            console.error("Failed to load delivery data", error);
        }
    };

    const filteredDeliveries = useMemo(() => {
        return deliveries.filter(delivery => {
            const matchesSearch = (delivery.deliveryNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (delivery.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || delivery.status.toLowerCase() === statusFilter.toLowerCase();
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
            orderType: 'General',
        });
        setDeliveryItems([]);
        setIsCreateModalOpen(true);
    };

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id.toString() === customerId); // ID type check
        if (customer) {
            setFormData({
                ...formData,
                customerId,
                deliveryAddress: `${customer.address || ''}, ${customer.city || ''}, ${customer.country || ''}`,
                salesOrderId: '',
            });
            setDeliveryItems([]);
        }
    };

    const handleSalesOrderChange = (salesOrderId: string) => {
        const order = salesOrders.find(o => o.id.toString() === salesOrderId.toString());
        if (order) {
            setFormData({
                ...formData,
                salesOrderId,
                orderType: order.orderType || 'General' // Inherit from sales order
            });
            setDeliveryItems(order.items);
        } else {
            setFormData({ ...formData, salesOrderId: '', orderType: 'General' });
            setDeliveryItems([]);
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct || !quantity) return;

        const product = products.find(p => p.id.toString() === selectedProduct.toString());
        if (!product) return;

        // Get customer-specific price if available
        const customer = customers.find(c => c.id.toString() === formData.customerId);
        let itemPrice = product.price;
        if (customer && customer.customerPrices && customer.customerPrices[product.id]) {
            itemPrice = customer.customerPrices[product.id];
        }

        const qty = parseInt(quantity);
        const itemTotal = qty * itemPrice;

        const existingItemIndex = deliveryItems.findIndex(item =>
            item.productId === product.id.toString() &&
            (item.colorId === (selectedColor || undefined))
        );

        if (existingItemIndex > -1) {
            const updatedItems = [...deliveryItems];
            const existing = updatedItems[existingItemIndex];
            const newQty = existing.quantity + qty;
            updatedItems[existingItemIndex] = {
                ...existing,
                quantity: newQty,
                total: newQty * existing.price // Simplification, normally recalculate tax/discount
            };
            setDeliveryItems(updatedItems);
        } else {
            const color = colorsList.find(c => c.id.toString() === selectedColor);
            setDeliveryItems([...deliveryItems, {
                productId: product.id.toString(),
                productName: product.name,
                uom: product.uom,
                quantity: qty,
                price: itemPrice,
                discount: 0,
                tax: 0,
                total: itemTotal,
                colorId: selectedColor || undefined,
                colorName: color?.name || undefined,
                isHaveLid: product.isHaveLid
            }]);
        }

        setSelectedProduct('');
        setQuantity('1');
        setSelectedColor('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (deliveryItems.length === 0) {
            alert('Please add at least one item to the delivery');
            return;
        }

        const customer = customers.find(c => c.id.toString() === formData.customerId);
        if (!customer) return;

        const salesOrder = formData.salesOrderId ? salesOrders.find(o => o.id.toString() === formData.salesOrderId) : undefined;

        const payload = {
            salesOrderId: formData.salesOrderId || null,
            customerId: formData.customerId,
            deliveryAddress: formData.deliveryAddress,
            deliveryDate: formData.deliveryDate || null,
            trackingNumber: formData.trackingNumber,
            notes: formData.notes,
            orderType: formData.orderType,
            items: deliveryItems.map(item => ({
                ...item,
                colorId: item.colorId || null,
            }))
        };

        try {
            await api.createDeliveryOrder(payload);
            loadData();
            setIsCreateModalOpen(false);
        } catch (error: any) {
            alert('Failed to create delivery order: ' + error.message);
        }
    };

    const handleMarkInTransit = async (id: string) => {
        try {
            await api.updateDeliveryOrder(id, { status: 'In Transit' });
            loadData();
        } catch (error: any) {
            alert('Failed to update status: ' + error.message);
        }
    };

    const handleMarkDelivered = async (id: string) => {
        try {
            await api.updateDeliveryOrder(id, { status: 'Delivered', deliveredDate: new Date() });
            loadData();
        } catch (error: any) {
            alert('Failed to update status: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this delivery order?')) {
            try {
                await api.deleteDeliveryOrder(id);
                loadData();
            } catch (error: any) {
                alert('Failed to delete delivery order: ' + error.message);
            }
        }
    };

    const handlePrintDeliveryOrder = async (id: string) => {
        const delivery = deliveries.find(d => d.id === id);
        if (delivery) {
            await generateDeliveryOrderPDF(delivery);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.approveDeliveryOrder(id);
            loadData();
            alert('Delivery order approved and invoice created successfully');
        } catch (error: any) {
            alert('Failed to approve: ' + error.message);
        }
    };

    const customerOrders = formData.customerId
        ? salesOrders.filter(o => o.customerId.toString() === formData.customerId.toString() && o.status === 'Confirmed')
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
                    <p className="text-2xl font-bold text-yellow-400">{deliveries.filter(d => d.status.toLowerCase() === 'pending').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">In Transit</p>
                    <p className="text-2xl font-bold text-blue-500">{deliveries.filter(d => d.status.toLowerCase() === 'in transit' || d.status.toLowerCase() === 'in_transit').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Delivered</p>
                    <p className="text-2xl font-bold text-green-500">{deliveries.filter(d => d.status.toLowerCase() === 'delivered').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="search-wrapper">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search deliveries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field search-input"
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
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
                            <th>Type</th>
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
                                    <span className={`badge ${delivery.orderType === 'Tax' ? 'badge-accent' : 'badge-info'}`}>
                                        {delivery.orderType}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${delivery.status === 'Delivered' ? 'badge-success' :
                                        delivery.status === 'In Transit' ? 'badge-info' :
                                            delivery.status === 'Approved' ? 'badge-warning' :
                                                delivery.status === 'Pending' ? 'badge-danger' : 'badge-danger'
                                        }`}>
                                        {delivery.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setViewingDelivery(delivery); setIsViewModalOpen(true); }} className="p-2 hover:bg-theme-hover rounded-lg transition-colors" title="View">
                                            <Eye className="w-4 h-4 text-primary-500" />
                                        </button>
                                        {/* {delivery.status === 'Pending' && (
                                            <button onClick={() => handleApprove(delivery.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Approve">
                                                <CheckSquare className="w-4 h-4 text-green-400" />
                                            </button>
                                        )}
                                        {delivery.status === 'Approved' && (
                                            <>
                                                <button onClick={() => handleMarkInTransit(delivery.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Mark In Transit">
                                                    <Truck className="w-4 h-4 text-blue-400" />
                                                </button>
                                            </>
                                        )}
                                        {delivery.status === 'In Transit' && (
                                            <button onClick={() => handleMarkDelivered(delivery.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Mark Delivered">
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            </button>
                                        )} */}
                                        {delivery.status === 'Pending' && (
                                            <button onClick={() => handleDelete(delivery.id)} className="p-2 hover:bg-theme-hover rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        )}
                                        {delivery.status !== 'Pending' && (
                                            <button onClick={() => handlePrintDeliveryOrder(delivery.id)} className="p-2 hover:bg-theme-hover rounded-lg transition-colors" title="Print">
                                                <Printer className="w-4 h-4 text-primary-500" />
                                            </button>
                                        )}
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
                            <SearchableSelect
                                required
                                value={formData.customerId}
                                onChange={(val) => handleCustomerChange(val)}
                                placeholder="Select Customer"
                                options={customers.filter(c => c.status === 'active').map(c => ({
                                    value: c.id,
                                    label: c.name,
                                    sublabel: c.email
                                }))}
                            />
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

                        {canAccessTax && (
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Order Type</label>
                                <select
                                    value={formData.orderType}
                                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value as 'General' | 'Tax' })}
                                    className="input-field"
                                    disabled={!!formData.salesOrderId} // Disable if inherited from Sales Order
                                >
                                    <option value="General">General</option>
                                    <option value="Tax">Tax</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Add Items (only if not from sales order) */}
                    {!formData.salesOrderId && (
                        <div className="border-t border-theme-border pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-theme-primary">Add Items</h3>
                                {formData.customerId && (
                                    <p className="text-sm text-blue-400">
                                        💡 Customer-specific prices will be applied automatically
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <SearchableSelect
                                        value={selectedProduct}
                                        onChange={(val) => { setSelectedProduct(val); setSelectedColor(''); }}
                                        placeholder="Select Product"
                                        disabled={!formData.customerId}
                                        options={products.map(product => {
                                            const customer = customers.find(c => c.id === formData.customerId);
                                            const customerPrice = customer?.customerPrices?.[product.id];
                                            const hasCustomPrice = customerPrice !== undefined;
                                            return {
                                                value: product.id,
                                                label: product.name,
                                                sublabel: hasCustomPrice
                                                    ? `LKR ${customerPrice.toFixed(2)} (Special) | Stock: ${product.stock} ${product.uom}`
                                                    : `LKR ${product.price} | Stock: ${product.stock} ${product.uom}`
                                            };
                                        })}
                                    />
                                </div>
                                <div>
                                    <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="input-field">
                                        <option value="">No Color</option>
                                        {products.find(p => p.id === selectedProduct)?.colors?.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
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
                        <div className="border-t border-theme-border pt-6 mb-4">
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
                                            <th className="text-center">Color</th>
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
                                                            className="w-20 bg-theme-surface border border-theme-border rounded px-2 py-1 text-theme-primary text-center focus:outline-none focus:border-primary-500"
                                                        />
                                                    ) : (
                                                        <span className="text-theme-primary">{item.quantity}</span>
                                                    )}
                                                </td>
                                                <td className="text-right text-theme-secondary">LKR {item.price.toFixed(2)}</td>
                                                <td className="text-right">
                                                    {!formData.salesOrderId ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.discount}
                                                            onChange={(e) => handleUpdateItemDiscount(item.productId, parseFloat(e.target.value) || 0)}
                                                            className="w-24 bg-theme-surface border border-theme-border rounded px-2 py-1 text-theme-primary text-right focus:outline-none focus:border-primary-500"
                                                        />
                                                    ) : (
                                                        <span className="text-theme-secondary">LKR {item.discount.toFixed(2)}</span>
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
                                                            className="w-24 bg-theme-surface border border-theme-border rounded px-2 py-1 text-theme-primary text-right focus:outline-none focus:border-primary-500"
                                                        />
                                                    ) : (
                                                        <span className="text-theme-secondary">LKR {item.tax.toFixed(2)}</span>
                                                    )}
                                                </td>
                                                <td className="font-bold text-right text-theme-primary">LKR {item.total.toFixed(2)}</td>
                                                <td className="py-2 px-2 text-center">
                                                    <select
                                                        value={item.colorId || ''}
                                                        onChange={(e) => {
                                                            const color = colorsList.find(c => c.id.toString() === e.target.value);
                                                            setDeliveryItems(deliveryItems.map(di =>
                                                                di.productId === item.productId
                                                                    ? { ...di, colorId: e.target.value || undefined, colorName: color?.name || undefined }
                                                                    : di
                                                            ));
                                                        }}
                                                        className="bg-transparent border border-white/20 rounded px-1 py-1 text-xs text-theme-secondary focus:outline-none focus:border-primary-500 min-w-[80px]"
                                                    >
                                                        <option value="">None</option>
                                                        {products.find(p => p.id === item.productId)?.colors?.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                    {item.colorId && (() => {
                                                        const col = colorsList.find(c => c.id.toString() === item.colorId);
                                                        return col ? <div className="w-3 h-3 rounded-full mx-auto mt-1" style={{ backgroundColor: col.hexCode }} /> : null;
                                                    })()}
                                                </td>
                                                {!formData.salesOrderId && (
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.productId)}
                                                            className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
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
                                        <tr className="border-t border-theme-border">
                                            <td colSpan={6} className="text-right font-semibold py-2 text-theme-secondary">
                                                Subtotal:
                                            </td>
                                            <td className="font-semibold py-2 text-right text-theme-primary">
                                                LKR {deliveryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                                            </td>
                                            {!formData.salesOrderId && <td></td>}
                                        </tr>
                                        <tr>
                                            <td colSpan={6} className="text-right font-semibold py-2 text-theme-secondary">
                                                Total Discount:
                                            </td>
                                            <td className="font-semibold text-yellow-400 py-2 text-right">
                                                -LKR {deliveryItems.reduce((sum, item) => sum + item.discount, 0).toFixed(2)}
                                            </td>
                                            {!formData.salesOrderId && <td></td>}
                                        </tr>
                                        <tr>
                                            <td colSpan={6} className="text-right font-semibold py-2 text-theme-secondary">
                                                Total Tax:
                                            </td>
                                            <td className="font-semibold text-blue-400 py-2 text-right">
                                                +LKR {deliveryItems.reduce((sum, item) => sum + item.tax, 0).toFixed(2)}
                                            </td>
                                            {!formData.salesOrderId && <td></td>}
                                        </tr>
                                        <tr className="border-t-2 border-theme-border">
                                            <td colSpan={6} className="text-right font-bold text-lg py-3 text-theme-primary">
                                                Grand Total:
                                            </td>
                                            <td className="font-bold text-lg text-primary-400 py-3 text-right">
                                                LKR {deliveryItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                                            </td>
                                            {!formData.salesOrderId && <td></td>}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {deliveryItems.some(item => item.isHaveLid) && (
                                <div className="mt-4 p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
                                    <h4 className="text-sm font-semibold text-primary-400 mb-2 flex items-center gap-2">
                                        <span className="text-lg">💡</span> Lid Requirements Summary
                                    </h4>
                                    <div className="space-y-1">
                                        {deliveryItems.filter(item => item.isHaveLid).map((item, idx) => (
                                            <div key={idx} className="text-sm text-theme-primary flex justify-between">
                                                <span>
                                                    <strong>{item.productName}</strong> Lid {item.colorName ? `(${item.colorName})` : ''}
                                                </span>
                                                <span className="text-primary-400 font-bold">Qty: {item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                <span className={`badge ${viewingDelivery.status === 'Delivered' ? 'badge-success' :
                                    viewingDelivery.status === 'In Transit' ? 'badge-info' :
                                        viewingDelivery.status === 'Approved' ? 'badge-success' :
                                            viewingDelivery.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {viewingDelivery.status}
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

                        {/* Sales Order Info Section */}
                        {/* {(viewingDelivery as any).SalesOrder && (
                            <div className="border-t border-theme-border pt-6">
                                <h3 className="text-lg font-semibold text-theme-primary mb-4">Sales Order Information</h3>
                                <div className="grid grid-cols-2 gap-4 bg-theme-surface p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm text-theme-secondary">Order Date</p>
                                        <p className="font-semibold text-theme-primary">
                                            {new Date((viewingDelivery as any).SalesOrder.orderDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-theme-secondary">Order Status</p>
                                        <p className="font-semibold text-theme-primary">{(viewingDelivery as any).SalesOrder.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-theme-secondary">Total Amount</p>
                                        <p className="font-semibold text-green-400">LKR {parseFloat((viewingDelivery as any).SalesOrder.total).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-theme-secondary">Payment State</p>
                                        <p className="font-semibold text-theme-primary">{(viewingDelivery as any).SalesOrder.paymentStatus || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )} */}

                        <div className="border-t border-theme-border pt-6">
                            <h3 className="text-lg font-semibold text-theme-primary mb-4">Items</h3>
                            <div className="space-y-2">
                                {viewingDelivery.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-3 bg-theme-surface rounded-lg">
                                        <div>
                                            <p className="font-medium text-theme-primary">{item.productName}</p>
                                            <p className="text-sm text-theme-secondary">Quantity: {item.quantity}</p>
                                            {item.isHaveLid && (
                                                <p className="text-xs text-primary-400 mt-1 italic">
                                                    💡 {item.productName} with {item.colorName || 'selected'} Lid quantity: {item.quantity}
                                                </p>
                                            )}
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

                        <div className="flex gap-4 pt-4 border-t border-theme-border">
                            {viewingDelivery.status === 'Pending' && (
                                <button
                                    onClick={() => {
                                        handleApprove(viewingDelivery.id);
                                        setIsViewModalOpen(false);
                                    }}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <CheckSquare className="w-5 h-5" />
                                    Approve Delivery
                                </button>
                            )}
                            {viewingDelivery.status === 'Approved' && (
                                <button
                                    onClick={() => {
                                        handleMarkInTransit(viewingDelivery.id);
                                        setIsViewModalOpen(false);
                                    }}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <Truck className="w-5 h-5" />
                                    Mark In Transit
                                </button>
                            )}
                            {viewingDelivery.status === 'In Transit' && (
                                <button
                                    onClick={() => {
                                        handleMarkDelivered(viewingDelivery.id);
                                        setIsViewModalOpen(false);
                                    }}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Mark Delivered
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
                )}
            </Modal>
        </div>
    );
}
