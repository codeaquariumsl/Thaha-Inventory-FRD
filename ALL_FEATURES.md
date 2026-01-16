# Thaha Inventory System Features

## 1. Dashboard
- **Key Metrics**: Total Revenue, Total Sales, Total Purchases, Low Stock Items.
- **Visualizations**: Recent Sales (last 5), Top Selling Products, Low Stock Alerts.

## 2. Product Management
- **Product CRUD**: Add, Edit, Delete, View Products.
- **Fields**: Name, SKU, Category, Supplier, Selling Price, Cost Price, Stock Quantity, Reorder Level, Description, UOM.
- **Search & Filter**: Search by Name/SKU, Filter by Category.
- **Stock Alert**: Visual indicator for low stock items.

## 3. Sales Management
### 3.1 Sales Orders
- Create Orders: Select Customer, Add Products (w/ Qty, Discount), Delivery Date.
- Workflow: Draft -> Confirmed -> Processing -> Completed -> Cancelled.
- List View: Status tracking, View details.
- Item Table: Detailed table with calculations (Price, Discount, Tax, Total).

### 3.2 Delivery Orders
- Linked to Sales Orders.
- Workflow: Pending -> In Transit -> Delivered -> Cancelled.
- Features: Address Management, Tracking Numbers, Dates.

### 3.3 Sales Invoices
- Generate Invoices: Link to Sales Orders, Payment Terms (Net 7/15/30 etc.).
- Workflow: Draft -> Sent -> Paid (Partial/Full) -> Overdue.
- Tracking: Amount Paid, Amount Due.

### 3.4 Sales Returns
- Process Returns: Link to Invoice, Return Reason.
- Workflow: Pending -> Approved/Rejected -> Refunded.
- Refund Methods: Cash, Card, Credit Note.

### 3.5 Customer Receipts
- Record Payments: Link to Invoices or On Account.
- Methods: Cash, Card, Online, Check, Bank Transfer.
- Tracking: Reference Numbers.

### 3.6 Customer Management
- Customer CRUD: Name, Contact Info, Address, Tax ID.
- Credit Management: Credit Limit, Current Balance, Visual Credit Usage.

## 4. Purchase Management
- **Purchase Orders**: Select Supplier, Add Items.
- **Workflow**: Pending -> Received -> Cancelled.
- **Payment Status**: Unpaid, Partial, Paid.
- **Receiving**: Mark items as received to update stock.

## 5. Stock Management
- **Stock Overview**: Current levels, Reorder levels, Value, Status (In Stock, Low, Critical, Out).
- **Stock Movements**:
  - Stock In (Purchases)
  - Stock Out (Sales)
  - Adjustments (Manual corrections)
- **History**: Log of all movements with user, date, reason.

## 6. General/System
- **Theme**: Dark/Light mode toggle.
- **Responsive Design**: Mobile-friendly interfaces.
- **Data Persistence**: (Planned Backend Integration) - currently mock data.
