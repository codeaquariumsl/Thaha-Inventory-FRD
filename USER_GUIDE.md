# User Guide - Inventory Management System

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Products](#managing-products)
4. [Processing Sales](#processing-sales)
5. [Creating Purchase Orders](#creating-purchase-orders)
6. [Stock Management](#stock-management)

## Getting Started

### Installation

Due to PowerShell execution policy restrictions, use the provided batch files:

1. **Install Dependencies**: Double-click `install.bat` or run in Command Prompt:
   ```
   cmd /c npm install
   ```

2. **Start Development Server**: Double-click `start.bat` or run:
   ```
   cmd /c npm run dev
   ```

3. **Access the Application**: Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Alternative Installation Method

If you prefer to change the execution policy temporarily:

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Then you can use: `npm install` and `npm run dev`

## Dashboard Overview

The dashboard provides a comprehensive view of your inventory system:

### Key Metrics
- **Total Revenue**: Sum of all completed sales
- **Total Sales**: Number of completed transactions
- **Total Purchases**: Sum of all purchase orders
- **Low Stock Items**: Products at or below reorder level

### Sections
1. **Recent Sales**: Last 5 sales transactions
2. **Top Selling Products**: Best performers by revenue
3. **Low Stock Alert**: Products needing reorder

## Managing Products

### Adding a New Product

1. Navigate to **Products** page
2. Click **Add Product** button
3. Fill in the required fields:
   - Product Name *
   - SKU (Stock Keeping Unit) *
   - Category *
   - Supplier *
   - Price (selling price) *
   - Cost (purchase cost) *
   - Stock Quantity *
   - Reorder Level *
   - Description (optional)
4. Click **Add Product**

### Editing a Product

1. Find the product in the grid
2. Click the **Edit** icon (pencil)
3. Update the fields
4. Click **Update Product**

### Deleting a Product

1. Find the product in the grid
2. Click the **Delete** icon (trash)
3. Confirm deletion

### Searching and Filtering

- Use the **search bar** to find products by name or SKU
- Use the **category dropdown** to filter by category
- Products with low stock are highlighted with a yellow indicator

## Processing Sales

### Creating a New Sale

1. Navigate to **Sales** page
2. Click **New Sale** button
3. Enter customer information:
   - Customer Name *
   - Customer Email (optional)
4. Add items to the sale:
   - Select a product from the dropdown
   - Enter quantity
   - Click **Add**
   - Repeat for multiple items
5. Set payment details:
   - Choose payment method (Cash, Card, Online)
   - Enter discount amount (if applicable)
6. Review the totals (Subtotal, Discount, Tax, Total)
7. Click **Create Sale**

### Managing Sales

- **View Details**: Click the eye icon to see full sale information
- **Complete Sale**: Click the dollar icon to mark pending sales as completed
- **Delete Sale**: Click the trash icon to remove a sale
- **Filter Sales**: Use status dropdown to filter by Pending, Completed, or Cancelled

### Understanding Sale Status

- **Pending**: Sale created but not yet completed
- **Completed**: Sale finalized and payment received
- **Cancelled**: Sale was cancelled

## Creating Purchase Orders

### Creating a New Purchase Order

1. Navigate to **Purchases** page
2. Click **New Purchase Order** button
3. Select supplier:
   - Choose from dropdown (email auto-fills)
4. Add items to purchase:
   - Select product from dropdown
   - Enter quantity
   - Click **Add**
   - Repeat for multiple items
5. Review totals (Subtotal, Tax, Total)
6. Click **Create Purchase Order**

### Managing Purchase Orders

- **View Details**: Click the eye icon to see full order information
- **Mark as Received**: Click the checkmark icon when inventory arrives
- **Delete Order**: Click the trash icon to remove an order
- **Filter Orders**: Use status dropdown to filter orders

### Understanding Purchase Status

**Order Status:**
- **Pending**: Order placed, awaiting delivery
- **Received**: Inventory has been received
- **Cancelled**: Order was cancelled

**Payment Status:**
- **Unpaid**: Payment not yet made
- **Partial**: Partial payment made
- **Paid**: Fully paid

## Stock Management

### Viewing Stock Levels

The **Stock** page shows:
- Current stock for all products
- Reorder levels
- Unit costs
- Total stock value
- Status indicators (In Stock, Low, Critical, Out of Stock)

### Recording Stock Movements

1. Click **Record Movement** button
2. Select product
3. Choose movement type:
   - **Stock In**: Adding inventory (e.g., from purchase)
   - **Stock Out**: Removing inventory (e.g., from sale)
   - **Adjustment**: Manual correction
4. Enter quantity
5. Enter reference (e.g., PUR-2024-001, SAL-2024-001)
6. Enter reason for movement
7. Click **Record Movement**

### Understanding Stock Status

- **In Stock** (Green): Stock above reorder level
- **Low** (Blue): Stock at reorder level
- **Critical** (Yellow): Stock below half of reorder level
- **Out of Stock** (Red): No stock available

### Stock Movement History

View all stock changes with:
- Date and time
- Product name
- Movement type (In/Out/Adjustment)
- Quantity changed
- Reference number
- Reason
- User who made the change

## Tips and Best Practices

### Product Management
- Set realistic reorder levels based on sales velocity
- Keep SKUs unique and consistent
- Update prices regularly
- Review low stock alerts daily

### Sales Processing
- Always verify customer information
- Double-check quantities before completing sales
- Use discounts consistently
- Mark sales as completed promptly

### Purchase Orders
- Create purchase orders when stock reaches reorder level
- Verify supplier information
- Mark orders as received when inventory arrives
- Track payment status

### Stock Management
- Record all stock movements immediately
- Use clear, descriptive references
- Explain reasons for adjustments
- Monitor stock value regularly
- Review movement history for discrepancies

## Keyboard Shortcuts

- **Esc**: Close modal dialogs
- **Click outside modal**: Close modal
- **Tab**: Navigate form fields

## Troubleshooting

### Installation Issues

**Problem**: npm commands not working
**Solution**: Use the provided batch files or change PowerShell execution policy

**Problem**: Dependencies not installing
**Solution**: Ensure you have Node.js 18+ installed and internet connection

### Application Issues

**Problem**: Page not loading
**Solution**: Ensure dev server is running on port 3000

**Problem**: Data not saving
**Solution**: This is a demo with mock data. Changes are stored in browser memory and reset on refresh.

## Future Features

The following features are planned for future releases:
- Database integration for persistent data
- User authentication and roles
- PDF/Excel export
- Advanced reporting
- Barcode scanning
- Multi-location support
- Automated reordering
- Email notifications

## Support

For questions or issues, please refer to the README.md file or contact the development team.
