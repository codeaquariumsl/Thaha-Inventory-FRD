'use client';

import React, { useState, useMemo, useEffect } from 'react';

import Modal from '@/components/Modal';
import { Plus, Search, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import { SalesOrder, Customer, Product, EnhancedSaleItem, Color } from '@/types';
import * as api from '@/lib/api';
import ToggleSwitch from '@/components/ToggleSwitch';
// import { products as initialProducts } from '@/data/mockData'; // We will fetch products too

export default function SalesOrdersTab() {
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingOrder, setViewingOrder] = useState<SalesOrder | null>(null);
    const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        customerId: '',
        deliveryDate: '',
        notes: '',
        orderType: 'General' as 'General' | 'Tax',
    });

    const canAccessTax = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'tax_user';

    const [orderItems, setOrderItems] = useState<EnhancedSaleItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [discount, setDiscount] = useState('0');
    const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
    const [selectedColor, setSelectedColor] = useState('');
    const [colorsList, setColorsList] = useState<Color[]>([]);

    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [isEditingItem, setIsEditingItem] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [ordersData, customersData, productsData, colorsData] = await Promise.all([
                api.getSalesOrders(),
                api.getCustomers(),
                api.getProducts(),
                api.getColors()
            ]);
            setColorsList(colorsData || []);

            const mappedOrders = ordersData.map((order: any) => ({
                ...order,
                id: order.id.toString(),
                customerName: order.Customer ? order.Customer.name : 'Unknown',
                subtotal: parseFloat(order.subtotal) || 0,
                tax: parseFloat(order.tax) || 0,
                discount: parseFloat(order.discount) || 0,
                total: parseFloat(order.total) || 0,
                items: order.items ? order.items.map((item: any) => {
                    const price = parseFloat(item.price) || 0;
                    const quantity = parseInt(item.quantity) || 0;
                    const discount = parseFloat(item.discount) || 0;
                    const total = parseFloat(item.total) || 0;
                    // Recalculate tax for frontend display consistency (10%)
                    const itemSub = quantity * price;
                    const itemTax = (itemSub - discount) * 0.1;
                    const colorIdStr = item.colorId ? item.colorId.toString() : undefined;
                    const matchedColor = colorIdStr ? (colorsData || []).find((c: any) => c.id.toString() === colorIdStr) : null;

                    return {
                        ...item,
                        id: item.id.toString(),
                        productId: item.productId.toString(),
                        productName: item.Product ? item.Product.name : 'Unknown',
                        uom: item.Product ? item.Product.uom : 'pcs',
                        price,
                        quantity,
                        discount,
                        tax: itemTax,
                        total: total || (itemSub - discount + itemTax),
                        colorId: colorIdStr,
                        colorName: matchedColor?.name || undefined,
                        isHaveLid: item.Product ? item.Product.isHaveLid : false
                    };
                }) : [],
                deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : undefined,
                createdAt: new Date(order.createdAt),
                updatedAt: new Date(order.updatedAt)
            }));

            setOrders(mappedOrders);
            setCustomers(customersData);
            setProducts((productsData.data || []).map((p: any) => ({
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
            console.error("Failed to load data", error);
            alert("Failed to load data from backend. Ensure backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order: SalesOrder) => {
            const matchesSearch = (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const calculateTotals = () => {
        const subtotal = orderItems.reduce((sum: number, item: EnhancedSaleItem) => sum + (item.quantity * item.price), 0);
        const totalDiscount = orderItems.reduce((sum: number, item: EnhancedSaleItem) => sum + item.discount, 0);
        const tax = formData.orderType === 'Tax' ? (subtotal - totalDiscount) * 0.1 : 0;
        const total = subtotal - totalDiscount + tax;
        return { subtotal, tax, totalDiscount, total };
    };

    const handleOpenModal = (order?: SalesOrder) => {
        if (order) {
            setEditingOrder(order);
            setFormData({
                customerId: order.customerId,
                deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
                notes: order.notes || '',
                orderType: order.orderType || 'General',
            });
            setOrderItems(order.items);
        } else {
            setEditingOrder(null);
            setFormData({ customerId: '', deliveryDate: new Date().toISOString().split('T')[0], notes: '', orderType: 'General' });
            setOrderItems([]);
        }
        setEditingItemIndex(null);
        setIsEditingItem(false);
        setIsModalOpen(true);
    };

    const handleEditItem = (index: number) => {
        const item = orderItems[index];
        setSelectedProduct(item.productId);
        setQuantity(item.quantity.toString());
        // For discount, we need to know if it was percentage or amount.
        // Currently EnhancedSaleItem only stores the computed discount amount.
        // But the field 'discount' in state is what the user typed.
        // Let's assume it was an amount for now, or just fill the amount.
        setDiscount(item.discount.toString());
        setDiscountType('amount');
        setSelectedColor(item.colorId || '');
        setEditingItemIndex(index);
        setIsEditingItem(true);
    };

    const handleUpdateItemColor = (productId: string, colorId: string) => {
        const color = colorsList.find(c => c.id.toString() === colorId);
        setOrderItems(orderItems.map(item =>
            item.productId === productId
                ? { ...item, colorId, colorName: color?.name || '' }
                : item
        ));
    };

    const handleAddItem = () => {
        if (!selectedProduct || !quantity) return;

        const product = products.find((p: any) => p.id.toString() === selectedProduct);
        if (!product) return;

        let price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        const qty = parseInt(quantity);
        const discInput = parseFloat(discount) || 0;
        const itemSubtotal = qty * price;

        let disc = 0;
        if (discountType === 'percent') {
            disc = (itemSubtotal * discInput) / 100;
        } else {
            disc = discInput;
        }

        const itemTax = formData.orderType === 'Tax' ? (itemSubtotal - disc) * 0.1 : 0;
        const itemTotal = itemSubtotal - disc + itemTax;
        const color = colorsList.find(c => c.id.toString() === selectedColor);

        if (isEditingItem && editingItemIndex !== null) {
            const updatedItems = [...orderItems];
            updatedItems[editingItemIndex] = {
                ...updatedItems[editingItemIndex],
                productId: product.id.toString(),
                productName: product.name,
                uom: product.uom,
                quantity: qty,
                price: price,
                discount: disc,
                tax: itemTax,
                total: itemTotal,
                colorId: selectedColor || undefined,
                colorName: color?.name || undefined,
                isHaveLid: product.isHaveLid
            };
            setOrderItems(updatedItems);
            setIsEditingItem(false);
            setEditingItemIndex(null);
        } else {
            const existingItem = orderItems.find(item =>
                item.productId === product.id.toString() &&
                (item.colorId === (selectedColor || undefined))
            );

            if (existingItem) {
                setOrderItems(orderItems.map(item =>
                    item.productId === product.id.toString() && (item.colorId === (selectedColor || undefined))
                        ? {
                            ...item,
                            quantity: item.quantity + qty,
                            discount: item.discount + disc,
                            tax: formData.orderType === 'Tax' ? ((item.quantity + qty) * item.price - (item.discount + disc)) * 0.1 : 0,
                            total: ((item.quantity + qty) * item.price) - (item.discount + disc) + (formData.orderType === 'Tax' ? ((item.quantity + qty) * item.price - (item.discount + disc)) * 0.1 : 0),
                        }
                        : item
                ));
            } else {
                setOrderItems([...orderItems, {
                    productId: product.id.toString(),
                    productName: product.name,
                    uom: product.uom,
                    quantity: qty,
                    price: price,
                    discount: disc,
                    tax: itemTax,
                    total: itemTotal,
                    colorId: selectedColor || undefined,
                    colorName: color?.name || undefined,
                    isHaveLid: product.isHaveLid
                }]);
            }
        }

        setSelectedProduct('');
        setQuantity('1');
        setDiscount('0');
        setSelectedColor('');
    };

    const handleRemoveItem = (productId: string) => {
        setOrderItems(orderItems.filter(item => item.productId !== productId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (orderItems.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }

        const customer = customers.find(c => c.id.toString() === formData.customerId.toString());
        if (!customer) return;

        const { subtotal, tax, totalDiscount, total } = calculateTotals();

        const orderDataPayload = {
            orderNumber: editingOrder?.orderNumber || `SO-${Date.now()}`, // Backend should handle or we generate unique. Backend model has unique constraint.
            customerId: formData.customerId,
            items: orderItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount,
                total: item.total,
                colorId: item.colorId || null,
            })),
            subtotal,
            tax,
            discount: totalDiscount,
            total,
            status: editingOrder?.status || 'Draft',
            deliveryDate: formData.deliveryDate ? formData.deliveryDate : null,
            notes: formData.notes,
            orderType: formData.orderType,
        };

        try {
            if (editingOrder) {
                await api.updateSalesOrder(editingOrder.id, orderDataPayload);
            } else {
                await api.createSalesOrder(orderDataPayload);
            }
            await loadData(); // Reload to get freshness
            setIsModalOpen(false);
        } catch (error: any) {
            alert('Failed to save order: ' + error.message);
        }
    };

    const handleConfirmOrder = async (id: string) => {
        try {
            // We need to send full update or partial? Controller uses update() with body.
            // I can just update status?
            // Controller: updateSalesOrder takes body and updates fields.
            await api.updateSalesOrder(id, { status: 'Confirmed' }); // 'Confirmed' matches Enum in backend? 'Confirmed' (capitalized in model?)
            // Model: 'confirmed' (lowercase) or 'Confirmed'? 
            // SalesOrder.js: DataTypes.ENUM('Draft', 'Confirmed', 'Processing', 'Completed', 'Cancelled') -> Capitalized!

            await loadData();
        } catch (error: any) {
            alert('Failed to confirm order: ' + error.message);
        }
    };

    const handleApproveOrder = async (id: string) => {
        try {
            await api.approveSalesOrder(id);
            setIsViewModalOpen(false);
            loadData();
        } catch (error: any) {
            alert('Failed to approve order: ' + error.message);
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (confirm('Are you sure you want to delete this order?')) {
            try {
                await api.deleteSalesOrder(id);
                loadData();
            } catch (error: any) {
                alert('Failed to delete order: ' + error.message);
            }
        }
    };

    const totals = calculateTotals();

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-primary">Sales Orders</h2>
                    <p className="text-theme-secondary">Create and manage customer orders</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 w-fit">
                    <Plus className="w-5 h-5" />
                    New Sales Order
                </button>
            </div>

            {/* Stats */}
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-theme-primary">{orders.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Order Value</p>
                    <p className="text-2xl font-bold text-theme-primary">LKR {orders.reduce((sum: number, o: SalesOrder) => sum + o.subtotal, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Discount</p>
                    <p className="text-2xl font-bold text-yellow-400">LKR {orders.reduce((sum: number, o: SalesOrder) => sum + o.discount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Net Amount</p>
                    <p className="text-2xl font-bold text-green-400">LKR {orders.reduce((sum: number, o: SalesOrder) => sum + o.total, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="search-wrapper">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field search-input"
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Type</th>
                            <th>Delivery Date</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="font-semibold">{order.orderNumber}</td>
                                <td>{order.customerName}</td>
                                <td>{order.items.length} items</td>
                                <td className="font-bold text-right">{order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>
                                    <span className={`badge ${order.orderType === 'Tax' ? 'badge-accent' : 'badge-info'}`}>
                                        {order.orderType}
                                    </span>
                                </td>
                                <td>{order.deliveryDate ? order.deliveryDate.toLocaleDateString() : '-'}</td>
                                <td>
                                    <span className={`badge ${order.status === 'Completed' ? 'badge-success' :
                                        order.status === 'Confirmed' || order.status === 'Processing' ? 'badge-info' :
                                            order.status === 'Draft' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{order.createdAt.toLocaleDateString()}</td>
                                <td>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setViewingOrder(order); setIsViewModalOpen(true); }} className="p-2 hover:bg-theme-hover rounded-lg transition-colors" title="View">
                                            <Eye className="w-4 h-4 text-primary-500" />
                                        </button>
                                        {order.status === 'Draft' && (
                                            <button onClick={() => handleOpenModal(order)} className="p-2 hover:bg-theme-hover rounded-lg transition-colors" title="Edit">
                                                <Edit className="w-4 h-4 text-blue-500" />
                                            </button>
                                        )}
                                        {/* {order.status === 'Draft' && (
                                            <button onClick={() => handleConfirmOrder(order.id)} className="p-2 hover:bg-theme-hover rounded-lg transition-colors" title="Confirm">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            </button>
                                        )} */}
                                        {order.status === 'Draft' && (
                                            <button onClick={() => handleDeleteOrder(order.id)} className="p-2 hover:bg-theme-hover rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOrder ? 'Edit Sales Order' : 'New Sales Order'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Customer *</label>
                            <SearchableSelect
                                required
                                value={formData.customerId}
                                onChange={(val) => setFormData({ ...formData, customerId: val })}
                                placeholder="Select Customer"
                                options={customers.filter(c => c.status === 'active').map(c => ({
                                    value: c.id,
                                    label: c.name,
                                    sublabel: c.phone
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Delivery Date</label>
                            <input type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} className="input-field" />
                        </div>
                        {canAccessTax && (
                            <ToggleSwitch
                                label="Order Type"
                                leftLabel="General"
                                rightLabel="Tax"
                                checked={formData.orderType === 'Tax'}
                                onChange={(checked: boolean) => setFormData({ ...formData, orderType: checked ? 'Tax' : 'General' })}
                                description="Select 'Tax' for invoice tracking or 'General' for standard orders"
                            />
                        )}
                    </div>

                    <div className="border-t border-theme-border pt-6">
                        <h3 className="text-lg font-semibold text-theme-primary mb-4">Add Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Product</label>
                                <SearchableSelect
                                    value={selectedProduct}
                                    onChange={(val) => { setSelectedProduct(val); setSelectedColor(''); }}
                                    placeholder="Select Product"
                                    options={products.map(p => ({
                                        value: p.id,
                                        label: p.name,
                                        sublabel: `LKR ${typeof p.price === 'number' ? p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.price}`
                                    }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Quantity</label>
                                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" placeholder="Qty" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Price</label>
                                <input
                                    type="number"
                                    className="input-field bg-white/5"
                                    placeholder="Price"
                                    value={selectedProduct ? (
                                        customers.find(c => c.id.toString() === formData.customerId)?.customerPrices?.[selectedProduct] ||
                                        products.find(p => p.id.toString() === selectedProduct)?.price || 0
                                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Discount</label>
                                <div className="flex">
                                    <input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input-field rounded-r-none" placeholder="Value" />
                                    <button
                                        type="button"
                                        onClick={() => setDiscountType(discountType === 'amount' ? 'percent' : 'amount')}
                                        className="bg-theme-surface border border-theme-border border-l-0 rounded-r-lg px-3 text-theme-primary hover:bg-theme-hover transition-colors font-bold min-w-[50px]"
                                    >
                                        {discountType === 'amount' ? 'LKR' : '%'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Color</label>
                                <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="input-field">
                                    <option value="">No Color</option>
                                    {products.find(p => p.id === selectedProduct)?.colors?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>



                        <button type="button" onClick={handleAddItem} className="btn-secondary mb-4">
                            {isEditingItem ? 'Update Item' : 'Add Item'}
                        </button>
                        {isEditingItem && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditingItem(false);
                                    setEditingItemIndex(null);
                                    setSelectedProduct('');
                                    setQuantity('1');
                                    setDiscount('0');
                                    setSelectedColor('');
                                }}
                                className="btn-outline ml-2 mb-4"
                            >
                                Cancel Edit
                            </button>
                        )}

                        {orderItems.length > 0 && (
                            <div className="overflow-x-auto mb-4">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-theme-border">
                                            <th className="text-left text-sm font-semibold text-theme-secondary pb-3 pr-4">Item Name</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Qty</th>
                                            <th className="text-center text-sm font-semibold text-theme-secondary pb-3 px-2">UOM</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Price</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Discount</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Disc. Price</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Value</th>
                                            <th className="text-center text-sm font-semibold text-theme-secondary pb-3 px-2">Color</th>
                                            <th className="text-center text-sm font-semibold text-theme-secondary pb-3 pl-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item, index) => {
                                            const discountedPrice = item.price - (item.discount / item.quantity);
                                            const lineValue = item.quantity * discountedPrice;

                                            return (
                                                <tr key={item.productId} className="border-b border-theme-border hover:bg-theme-hover transition-colors">
                                                    <td className="py-3 pr-4 text-theme-primary font-medium">{item.productName}</td>
                                                    <td className="py-3 px-2 text-right text-theme-primary font-semibold">{item.quantity}</td>
                                                    <td className="py-3 px-2 text-center text-theme-secondary text-sm">{item.uom || 'pcs'}</td>
                                                    <td className="py-3 px-2 text-right text-theme-secondary">LKR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-right text-yellow-400">LKR {item.discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-right text-green-400 font-semibold">LKR {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-right text-theme-primary font-bold">LKR {lineValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-center">
                                                        <select
                                                            value={item.colorId || ''}
                                                            onChange={(e) => handleUpdateItemColor(item.productId, e.target.value)}
                                                            className="bg-transparent border border-white/20 rounded px-1 py-1 text-xs text-theme-secondary focus:outline-none focus:border-primary-500 min-w-[80px]"
                                                        >
                                                            <option value="">None</option>
                                                            {products.find(p => p.id === item.productId)?.colors?.map(c => (
                                                                <option key={c.id} value={c.id}>
                                                                    {c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {item.colorId && (() => {
                                                            const col = colorsList.find(c => c.id.toString() === item.colorId);
                                                            return col ? <div className="w-3 h-3 rounded-full mx-auto mt-1" style={{ backgroundColor: col.hexCode }} /> : null;
                                                        })()}
                                                    </td>
                                                    <td className="py-3 pl-2 text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditItem(index)}
                                                                className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                                title="Edit item"
                                                            >
                                                                <Edit className="w-4 h-4 text-primary-500" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(item.productId)}
                                                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                                title="Remove item"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {orderItems.some(item => item.isHaveLid) && (
                            <div className="mt-4 p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
                                <h4 className="text-sm font-semibold text-primary-400 mb-2 flex items-center gap-2">
                                    <span className="text-lg">💡</span> Lid Requirements Summary
                                </h4>
                                <div className="space-y-1">
                                    {orderItems.filter(item => item.isHaveLid).map((item, idx) => (
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

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">Notes</label>
                        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" rows={3} placeholder="Order notes..." />
                    </div>

                    {orderItems.length > 0 && (
                        <div className="bg-theme-surface rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-theme-secondary">
                                <span>Subtotal:</span>
                                <span>LKR {totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Discount:</span>
                                <span>-LKR {totals.totalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {formData.orderType === 'Tax' && (
                                <div className="flex justify-between text-theme-secondary">
                                    <span>Tax:</span>
                                    <span>LKR {totals.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-theme-primary border-t border-theme-border pt-2">
                                <span>Total:</span>
                                <span>LKR {totals.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="btn-primary flex-1">{editingOrder ? 'Update Order' : 'Create Order'}</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Sales Order Details">
                {viewingOrder && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-theme-secondary">Order Number</p>
                                <p className="font-semibold text-theme-primary">{viewingOrder.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Customer</p>
                                <p className="font-semibold text-theme-primary">{viewingOrder.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Delivery Date</p>
                                <p className="font-semibold text-theme-primary">{viewingOrder.deliveryDate ? viewingOrder.deliveryDate.toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Status</p>
                                <span className={`badge ${viewingOrder.status === 'Completed' ? 'badge-success' :
                                    viewingOrder.status === 'Confirmed' || viewingOrder.status === 'Processing' ? 'badge-info' :
                                        viewingOrder.status === 'Draft' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {viewingOrder.status}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-theme-border pt-6">
                            <h3 className="text-lg font-semibold text-theme-primary mb-4">Items</h3>
                            <div className="space-y-2">
                                {viewingOrder.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-3 bg-theme-surface rounded-lg">
                                        <div>
                                            <p className="font-medium text-theme-primary">{item.productName}</p>
                                            <p className="text-sm text-theme-secondary">{item.quantity} × LKR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            {item.isHaveLid && (
                                                <p className="text-xs text-primary-400 mt-1 italic">
                                                    💡 {item.productName} with {item.colorName || 'selected'} Lid quantity: {item.quantity}
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-bold text-theme-primary">LKR {item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {viewingOrder.notes && (
                            <div>
                                <p className="text-sm text-theme-secondary mb-2">Notes</p>
                                <p className="text-theme-primary">{viewingOrder.notes}</p>
                            </div>
                        )}

                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-theme-secondary">
                                <span>Subtotal:</span>
                                <span>LKR {viewingOrder.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Discount:</span>
                                <span>-LKR {viewingOrder.discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {viewingOrder.orderType === 'Tax' && (
                                <div className="flex justify-between text-theme-secondary">
                                    <span>Tax:</span>
                                    <span>LKR {viewingOrder.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-theme-primary border-t border-white/10 pt-2">
                                <span>Total:</span>
                                <span>LKR {viewingOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-theme-border">
                            {viewingOrder.status === 'Draft' && (
                                <button
                                    onClick={() => handleApproveOrder(viewingOrder.id)}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Approve Order
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
