'use client';

import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useState, useMemo } from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertCircle, Layers, Box, Tags, LayoutGrid, List } from 'lucide-react';
import { products as initialProducts, categories as initialCategories } from '@/data/mockData';
import { Product, Category } from '@/types';

export default function ProductsPage() {
    const [products, setProducts] = useState(initialProducts);
    const [categoriesList, setCategoriesList] = useState(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'finished_good' | 'raw_material'>('finished_good');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        type: 'finished_good' as 'finished_good' | 'raw_material',
        description: '',
        price: '',
        cost: '',
        stock: '',
        reorderLevel: '',
        supplier: 'TechSupply Co.',
    });

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesType = product.type === activeTab;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            return matchesType && matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory, activeTab]);

    // Use categoriesList for filters instead of deriving from products
    const filterCategories = useMemo(() => {
        return ['all', ...categoriesList.map(c => c.name)];
    }, [categoriesList]);

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku,
                category: product.category,
                type: product.type,
                description: product.description,
                price: product.price.toString(),
                cost: product.cost.toString(),
                stock: product.stock.toString(),
                reorderLevel: product.reorderLevel.toString(),
                supplier: product.supplier,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                sku: '',
                category: categoriesList[0]?.name || '',
                type: activeTab, // Default to current tab
                description: '',
                price: '',
                cost: '',
                stock: '',
                reorderLevel: '',
                supplier: 'TechSupply Co.',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const newCategory: Category = {
            id: Date.now().toString(),
            name: newCategoryName,
            description: 'Custom category',
        };

        setCategoriesList([...categoriesList, newCategory]);
        setNewCategoryName('');
    };

    const handleDeleteCategory = (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            setCategoriesList(categoriesList.filter(c => c.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productData: Product = {
            id: editingProduct?.id || Date.now().toString(),
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            type: formData.type,
            description: formData.description,
            price: parseFloat(formData.price),
            cost: parseFloat(formData.cost),
            stock: parseInt(formData.stock),
            reorderLevel: parseInt(formData.reorderLevel),
            supplier: formData.supplier,
            imageUrl: editingProduct?.imageUrl || '',
            uom: 'pcs', // Default UOM
            createdAt: editingProduct?.createdAt || new Date(),
            updatedAt: new Date(),
        };

        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
        } else {
            setProducts([...products, productData]);
        }

        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-theme-primary mb-2">Products</h1>
                        <p className="text-theme-secondary">Manage your product inventory</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-theme-border">
                    <button
                        onClick={() => { setActiveTab('finished_good'); setSelectedCategory('all'); }}
                        className={`pb-4 px-4 flex items-center gap-2 transition-all relative ${activeTab === 'finished_good' ? 'text-primary-400' : 'text-theme-secondary hover:text-theme-primary'}`}
                    >
                        <Package className="w-5 h-5" />
                        <span className="font-medium">Finished Goods</span>
                        {activeTab === 'finished_good' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-400 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => { setActiveTab('raw_material'); setSelectedCategory('all'); }}
                        className={`pb-4 px-4 flex items-center gap-2 transition-all relative ${activeTab === 'raw_material' ? 'text-primary-400' : 'text-theme-secondary hover:text-theme-primary'}`}
                    >
                        <Layers className="w-5 h-5" />
                        <span className="font-medium">Raw Materials</span>
                        {activeTab === 'raw_material' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-400 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Main Content Area */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-theme-surface p-1 rounded-lg">
                                <button
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'text-theme-secondary hover:text-theme-primary'}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-400' : 'text-theme-secondary hover:text-theme-primary'}`}
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-theme-secondary">
                                <span className="bg-theme-surface px-3 py-1 rounded-full text-sm">
                                    {filteredProducts.length} items
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="btn-outline flex items-center gap-2"
                            >
                                <Tags className="w-5 h-5" />
                                Manage Categories
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="btn-primary flex items-center gap-2 w-fit"
                            >
                                <Plus className="w-5 h-5" />
                                Add {activeTab === 'finished_good' ? 'Product' : 'Material'}
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="glass-card p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10"
                                    autoFocus
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="input-field"
                            >
                                {filterCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Products View */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="glass-card p-6 animate-slide-up hover:border-primary-500/30 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${product.type === 'raw_material' ? 'bg-amber-500/20' : 'bg-primary-500/20'}`}>
                                            {product.type === 'raw_material' ? (
                                                <Layers className="w-6 h-6 text-amber-400" />
                                            ) : (
                                                <Package className="w-6 h-6 text-primary-400" />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-2 hover:bg-theme-surface rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4 text-primary-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 hover:bg-theme-surface rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-theme-primary mb-2">{product.name}</h3>
                                    <p className="text-sm text-theme-secondary mb-4">{product.sku}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-theme-secondary">Category:</span>
                                            <span className="text-theme-primary font-medium">{product.category}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-theme-secondary">Type:</span>
                                            <span className={`font-medium ${product.type === 'raw_material' ? 'text-amber-400' : 'text-blue-400'}`}>
                                                {product.type === 'finished_good' ? 'Finished Good' : 'Raw Material'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-theme-secondary">Price:</span>
                                            <span className="text-theme-primary font-bold">${product.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-theme-secondary">Stock:</span>
                                            <span className={`font-bold ${product.stock <= product.reorderLevel ? 'text-yellow-400' : 'text-green-400'
                                                }`}>
                                                {product.stock} units
                                            </span>
                                        </div>
                                    </div>

                                    {product.stock <= product.reorderLevel && (
                                        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                                            <span className="text-xs text-yellow-400 font-medium">Low Stock</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-theme-surface border-b border-theme-border">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">Name / SKU</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-theme-secondary uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-theme-secondary uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-theme-secondary uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme-border">
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-theme-surface transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${product.type === 'raw_material' ? 'bg-amber-500/20' : 'bg-primary-500/20'}`}>
                                                        {product.type === 'raw_material' ? (
                                                            <Layers className="w-4 h-4 text-amber-400" />
                                                        ) : (
                                                            <Package className="w-4 h-4 text-primary-400" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-theme-primary">{product.name}</div>
                                                    <div className="text-sm text-theme-secondary">{product.sku}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-theme-surface text-theme-secondary">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-theme-primary">
                                                    ${product.price.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className={`text-sm font-bold ${product.stock <= product.reorderLevel ? 'text-yellow-400' : 'text-green-400'}`}>
                                                        {product.stock}
                                                    </span>
                                                    {product.stock <= product.reorderLevel && (
                                                        <div className="text-xs text-yellow-500 mt-1">Low Stock</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(product)}
                                                            className="p-2 hover:bg-theme-surface rounded-lg transition-colors text-primary-400"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 hover:bg-theme-surface rounded-lg transition-colors text-red-400"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {filteredProducts.length === 0 && (
                        <div className="glass-card p-12 text-center mt-6">
                            <Box className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-theme-secondary mb-2">No items found</h3>
                            <p className="text-theme-secondary">Try adjusting your search or switch tabs</p>
                        </div>
                    )}
                </div>

                {/* Add/Edit Product Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingProduct ? 'Edit Item' : `Add New ${activeTab === 'finished_good' ? 'Product' : 'Material'}`}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    SKU *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter SKU"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Type *
                                </label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'finished_good' | 'raw_material' })}
                                    className="input-field"
                                >
                                    <option value="finished_good">Finished Good</option>
                                    <option value="raw_material">Raw Material</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Category *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select Category</option>
                                    {categoriesList.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Supplier *
                                </label>
                                <select
                                    required
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="TechSupply Co.">TechSupply Co.</option>
                                    <option value="Fashion Wholesale Inc.">Fashion Wholesale Inc.</option>
                                    <option value="Global Foods Ltd.">Global Foods Ltd.</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="input-field"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Cost ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    className="input-field"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="input-field"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Reorder Level *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.reorderLevel}
                                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                                    className="input-field"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows={3}
                                placeholder="Enter description"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="btn-primary flex-1">
                                {editingProduct ? 'Update Item' : 'Add Item'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="btn-outline flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Categories Management Modal */}
                <Modal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    title="Manage Categories"
                >
                    <div className="space-y-6">
                        <form onSubmit={handleAddCategory} className="flex gap-2">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="New category name"
                                className="input-field flex-1"
                                required
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap">
                                Add Category
                            </button>
                        </form>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {categoriesList.map(category => (
                                <div key={category.id} className="flex items-center justify-between p-3 bg-theme-surface rounded-lg border border-theme-border">
                                    <span className="text-theme-primary font-medium">{category.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="p-2 hover:bg-theme-surface rounded-lg transition-colors text-red-400"
                                        title="Delete Category"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {categoriesList.length === 0 && (
                                <p className="text-center text-theme-secondary py-4">No categories found</p>
                            )}
                        </div>
                    </div>
                </Modal>
            </main>
        </div>
    );
}
