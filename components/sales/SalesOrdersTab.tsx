'use client';

import Modal from '@/components/Modal';
import { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';
import { salesOrders as initialOrders, customers } from '@/data/salesData';
import { products } from '@/data/mockData';
import { SalesOrder, EnhancedSaleItem } from '@/types';

export default function SalesOrdersTab() {
    const [orders, setOrders] = useState(initialOrders);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingOrder, setViewingOrder] = useState<SalesOrder | null>(null);
    const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

    const [formData, setFormData] = useState({
        customerId: '',
        deliveryDate: '',
        notes: '',
    });

    const [orderItems, setOrderItems] = useState<EnhancedSaleItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [discount, setDiscount] = useState('0');

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const calculateTotals = () => {
        const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const totalDiscount = orderItems.reduce((sum, item) => sum + item.discount, 0);
        const tax = (subtotal - totalDiscount) * 0.1;
        const total = subtotal - totalDiscount + tax;
        return { subtotal, tax, totalDiscount, total };
    };

    const handleOpenModal = (order?: SalesOrder) => {
        if (order) {
            setEditingOrder(order);
            setFormData({
                customerId: order.customerId,
                deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : '',
                notes: order.notes || '',
            });
            setOrderItems(order.items);
        } else {
            setEditingOrder(null);
            setFormData({ customerId: '', deliveryDate: '', notes: '' });
            setOrderItems([]);
        }
        setIsModalOpen(true);
    };

    const handleAddItem = () => {
        if (!selectedProduct || !quantity) return;

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        // Determine effective price (Customer Price or Standard Price)
        const customer = customers.find(c => c.id === formData.customerId);
        let price = product.price;
        if (customer && customer.customerPrices && customer.customerPrices[selectedProduct]) {
            price = customer.customerPrices[selectedProduct];
        }

        const qty = parseInt(quantity);
        const disc = parseFloat(discount) || 0;
        const itemSubtotal = qty * price;
        const itemTax = (itemSubtotal - disc) * 0.1;
        const itemTotal = itemSubtotal - disc + itemTax;

        const existingItem = orderItems.find(item => item.productId === selectedProduct);

        if (existingItem) {
            setOrderItems(orderItems.map(item =>
                item.productId === selectedProduct
                    ? {
                        ...item,
                        quantity: item.quantity + qty,
                        discount: item.discount + disc,
                        tax: (item.quantity + qty) * item.price * 0.1,
                        total: ((item.quantity + qty) * item.price) - (item.discount + disc) + ((item.quantity + qty) * item.price * 0.1),
                    }
                    : item
            ));
        } else {
            setOrderItems([...orderItems, {
                productId: product.id,
                productName: product.name,
                uom: product.uom,
                quantity: qty,
                price: price,
                discount: disc,
                tax: itemTax,
                total: itemTotal,
            }]);
        }

        setSelectedProduct('');
        setQuantity('1');
        setDiscount('0');
    };

    const handleRemoveItem = (productId: string) => {
        setOrderItems(orderItems.filter(item => item.productId !== productId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (orderItems.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }

        const customer = customers.find(c => c.id === formData.customerId);
        if (!customer) return;

        const { subtotal, tax, totalDiscount, total } = calculateTotals();

        const orderData: SalesOrder = {
            id: editingOrder?.id || Date.now().toString(),
            orderNumber: editingOrder?.orderNumber || `SO-2024-${String(orders.length + 1).padStart(3, '0')}`,
            customerId: formData.customerId,
            customerName: customer.name,
            items: orderItems,
            subtotal,
            tax,
            discount: totalDiscount,
            total,
            status: editingOrder?.status || 'draft',
            deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
            notes: formData.notes,
            createdAt: editingOrder?.createdAt || new Date(),
            updatedAt: new Date(),
        };

        if (editingOrder) {
            setOrders(orders.map(o => o.id === editingOrder.id ? orderData : o));
        } else {
            setOrders([orderData, ...orders]);
        }

        setIsModalOpen(false);
    };

    const handleConfirmOrder = (id: string) => {
        setOrders(orders.map(o =>
            o.id === id ? { ...o, status: 'confirmed' as const, updatedAt: new Date() } : o
        ));
    };

    const handleDeleteOrder = (id: string) => {
        if (confirm('Are you sure you want to delete this order?')) {
            setOrders(orders.filter(o => o.id !== id));
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
                    <p className="text-2xl font-bold text-theme-primary">${orders.reduce((sum, o) => sum + o.subtotal, 0).toFixed(2)}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Discount</p>
                    <p className="text-2xl font-bold text-yellow-400">${orders.reduce((sum, o) => sum + o.discount, 0).toFixed(2)}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Net Amount</p>
                    <p className="text-2xl font-bold text-green-400">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
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
                                <td className="font-bold">${order.total.toFixed(2)}</td>
                                <td>{order.deliveryDate ? order.deliveryDate.toLocaleDateString() : '-'}</td>
                                <td>
                                    <span className={`badge ${order.status === 'completed' ? 'badge-success' :
                                        order.status === 'confirmed' || order.status === 'processing' ? 'badge-info' :
                                            order.status === 'draft' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{order.createdAt.toLocaleDateString()}</td>
                                <td>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setViewingOrder(order); setIsViewModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View">
                                            <Eye className="w-4 h-4 text-primary-400" />
                                        </button>
                                        <button onClick={() => handleOpenModal(order)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                                            <Edit className="w-4 h-4 text-blue-400" />
                                        </button>
                                        {order.status === 'draft' && (
                                            <button onClick={() => handleConfirmOrder(order.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Confirm">
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteOrder(order.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOrder ? 'Edit Sales Order' : 'New Sales Order'}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Customer *</label>
                            <select required value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} className="input-field">
                                <option value="">Select Customer</option>
                                {customers.filter(c => c.status === 'active').map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name} - {customer.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Delivery Date</label>
                            <input type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} className="input-field" />
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-theme-primary mb-4">Add Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Product</label>
                                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input-field">
                                    <option value="">Select Product</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Price</label>
                                <input
                                    type="number"
                                    className="input-field bg-white/5"
                                    placeholder="Price"
                                    value={selectedProduct ? (
                                        customers.find(c => c.id === formData.customerId)?.customerPrices?.[selectedProduct] ||
                                        products.find(p => p.id === selectedProduct)?.price || 0
                                    ).toFixed(2) : ''}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Quantity</label>
                                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" placeholder="Qty" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">Discount</label>
                                <input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input-field" placeholder="Discount" />
                            </div>
                        </div>
                        <button type="button" onClick={handleAddItem} className="btn-secondary mb-4">Add Item</button>

                        {orderItems.length > 0 && (
                            <div className="overflow-x-auto mb-4">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-white/20">
                                            <th className="text-left text-sm font-semibold text-theme-secondary pb-3 pr-4">Item Name</th>
                                            <th className="text-center text-sm font-semibold text-theme-secondary pb-3 px-2">UOM</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Price</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Qty</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Discount</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Disc. Price</th>
                                            <th className="text-right text-sm font-semibold text-theme-secondary pb-3 px-2">Value</th>
                                            <th className="text-center text-sm font-semibold text-theme-secondary pb-3 pl-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item) => {
                                            const discountedPrice = item.price - (item.discount / item.quantity);
                                            const lineValue = item.quantity * discountedPrice;

                                            return (
                                                <tr key={item.productId} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 pr-4 text-theme-primary font-medium">{item.productName}</td>
                                                    <td className="py-3 px-2 text-center text-theme-secondary text-sm">{item.uom || 'pcs'}</td>
                                                    <td className="py-3 px-2 text-right text-theme-secondary">${item.price.toFixed(2)}</td>
                                                    <td className="py-3 px-2 text-right text-theme-primary font-semibold">{item.quantity}</td>
                                                    <td className="py-3 px-2 text-right text-yellow-400">${item.discount.toFixed(2)}</td>
                                                    <td className="py-3 px-2 text-right text-green-400 font-semibold">${discountedPrice.toFixed(2)}</td>
                                                    <td className="py-3 px-2 text-right text-theme-primary font-bold">${lineValue.toFixed(2)}</td>
                                                    <td className="py-3 pl-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.productId)}
                                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">Notes</label>
                        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" rows={3} placeholder="Order notes..." />
                    </div>

                    {orderItems.length > 0 && (
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
                        <button type="submit" className="btn-primary flex-1">{editingOrder ? 'Update Order' : 'Create Order'}</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Sales Order Details">
                {viewingOrder && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-theme-secondary">Order Number</p>
                                <p className="font-semibold text-theme-primary">{viewingOrder.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Customer</p>
                                <p className="font-semibold text-theme-primary">{viewingOrder.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Status</p>
                                <span className={`badge ${viewingOrder.status === 'completed' ? 'badge-success' :
                                    viewingOrder.status === 'confirmed' || viewingOrder.status === 'processing' ? 'badge-info' :
                                        viewingOrder.status === 'draft' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {viewingOrder.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Delivery Date</p>
                                <p className="font-semibold text-theme-primary">{viewingOrder.deliveryDate ? viewingOrder.deliveryDate.toLocaleDateString() : '-'}</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-semibold text-theme-primary mb-4">Items</h3>
                            <div className="space-y-2">
                                {viewingOrder.items.map((item, index) => (
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

                        {viewingOrder.notes && (
                            <div>
                                <p className="text-sm text-theme-secondary mb-2">Notes</p>
                                <p className="text-theme-primary">{viewingOrder.notes}</p>
                            </div>
                        )}

                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-theme-secondary">
                                <span>Subtotal:</span>
                                <span>${viewingOrder.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Discount:</span>
                                <span>-${viewingOrder.discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Tax:</span>
                                <span>${viewingOrder.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-theme-primary border-t border-white/10 pt-2">
                                <span>Total:</span>
                                <span>${viewingOrder.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
