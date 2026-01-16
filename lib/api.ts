const API_BASE_URL = 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();

        if (errorData.error === 'Invalid or expired token') {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        throw new Error(errorData.error || 'API call failed');
    }

    return response.json();
}

// Products
export const getProducts = () => fetchAPI('/products');
export const getProductById = (id: string) => fetchAPI(`/products/${id}`);
export const createProduct = (data: any) => fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id: string, data: any) => fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id: string) => fetchAPI(`/products/${id}`, { method: 'DELETE' });

// Customers
export const getCustomers = () => fetchAPI('/customers');
export const getCustomerById = (id: string) => fetchAPI(`/customers/${id}`);
export const createCustomer = (data: any) => fetchAPI('/customers', { method: 'POST', body: JSON.stringify(data) });
export const updateCustomer = (id: string, data: any) => fetchAPI(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCustomer = (id: string) => fetchAPI(`/customers/${id}`, { method: 'DELETE' });

// Suppliers
export const getSuppliers = () => fetchAPI('/suppliers');
export const getSupplierById = (id: string) => fetchAPI(`/suppliers/${id}`);
export const createSupplier = (data: any) => fetchAPI('/suppliers', { method: 'POST', body: JSON.stringify(data) });
export const updateSupplier = (id: string, data: any) => fetchAPI(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSupplier = (id: string) => fetchAPI(`/suppliers/${id}`, { method: 'DELETE' });

// Sales Orders
export const getSalesOrders = () => fetchAPI('/sales-orders');
export const getSalesOrderById = (id: string) => fetchAPI(`/sales-orders/${id}`);
export const createSalesOrder = (data: any) => fetchAPI('/sales-orders', { method: 'POST', body: JSON.stringify(data) });
export const updateSalesOrder = (id: string, data: any) => fetchAPI(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSalesOrder = (id: string) => fetchAPI(`/sales-orders/${id}`, { method: 'DELETE' });
export const approveSalesOrder = (id: string) => fetchAPI(`/sales-orders/${id}/approve`, { method: 'PATCH' });

// Delivery Orders
export const getDeliveryOrders = () => fetchAPI('/delivery-orders');
export const getDeliveryOrderById = (id: string) => fetchAPI(`/delivery-orders/${id}`);
export const createDeliveryOrder = (data: any) => fetchAPI('/delivery-orders', { method: 'POST', body: JSON.stringify(data) });
export const updateDeliveryOrder = (id: string, data: any) => fetchAPI(`/delivery-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDeliveryOrder = (id: string) => fetchAPI(`/delivery-orders/${id}`, { method: 'DELETE' });
export const approveDeliveryOrder = (id: string) => fetchAPI(`/delivery-orders/${id}/approve`, { method: 'PATCH' });

// Invoices
export const getInvoices = () => fetchAPI('/invoices');
export const getInvoiceById = (id: string) => fetchAPI(`/invoices/${id}`);
export const createInvoice = (data: any) => fetchAPI('/invoices', { method: 'POST', body: JSON.stringify(data) });
export const updateInvoice = (id: string, data: any) => fetchAPI(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInvoice = (id: string) => fetchAPI(`/invoices/${id}`, { method: 'DELETE' });
export const approveInvoice = (id: string) => fetchAPI(`/invoices/${id}/approve`, { method: 'PATCH' });

// Payments
export const getPayments = () => fetchAPI('/payments');
export const getPaymentById = (id: string) => fetchAPI(`/payments/${id}`);
export const createPayment = (data: any) => fetchAPI('/payments', { method: 'POST', body: JSON.stringify(data) });
export const deletePayment = (id: string) => fetchAPI(`/payments/${id}`, { method: 'DELETE' });

// Sales Returns
export const getSalesReturns = () => fetchAPI('/sales-returns');
export const getSalesReturnById = (id: string) => fetchAPI(`/sales-returns/${id}`);
export const createSalesReturn = (data: any) => fetchAPI('/sales-returns', { method: 'POST', body: JSON.stringify(data) });
export const updateSalesReturn = (id: string, data: any) => fetchAPI(`/sales-returns/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Purchase Orders
export const getPurchaseOrders = () => fetchAPI('/purchase-orders');
export const getPurchaseOrderById = (id: string) => fetchAPI(`/purchase-orders/${id}`);
export const createPurchaseOrder = (data: any) => fetchAPI('/purchase-orders', { method: 'POST', body: JSON.stringify(data) });
export const updatePurchaseOrder = (id: string, data: any) => fetchAPI(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Stock Movements
export const getStockMovements = () => fetchAPI('/stock-movements');
export const createStockMovement = (data: any) => fetchAPI('/stock-movements', { method: 'POST', body: JSON.stringify(data) });

// Categories
export const getCategories = () => fetchAPI('/categories');
export const createCategory = (data: any) => fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id: string, data: any) => fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id: string) => fetchAPI(`/categories/${id}`, { method: 'DELETE' });

// Auth
export const login = (data: any) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) });

// Users
export const getUsers = () => fetchAPI('/users');
export const getUserById = (id: string) => fetchAPI(`/users/${id}`);
export const createUser = (data: any) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: string, data: any) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: string) => fetchAPI(`/users/${id}`, { method: 'DELETE' });

// Roles
export const getRoles = () => fetchAPI('/roles');
export const createRole = (data: any) => fetchAPI('/roles', { method: 'POST', body: JSON.stringify(data) });
export const updateRole = (id: string, data: any) => fetchAPI(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRole = (id: string) => fetchAPI(`/roles/${id}`, { method: 'DELETE' });
