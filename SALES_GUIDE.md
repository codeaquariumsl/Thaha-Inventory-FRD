# Enhanced Sales Management System - Feature Guide

## Overview
The Sales section has been completely redesigned with a comprehensive tabbed interface that includes:

1. **Sales Orders** - Create and manage customer orders
2. **Delivery Orders** - Track product deliveries
3. **Sales Invoices** - Generate and manage invoices
4. **Sales Returns** - Handle product returns and refunds
5. **Customer Receipts** - Record customer payments
6. **Customer Management** - Manage customer database

---

## 1. Sales Orders Tab

### Features:
- ✅ Create new sales orders with multiple items
- ✅ Select customers from the database
- ✅ Add products with quantities and discounts
- ✅ Automatic tax calculations (10%)
- ✅ Set delivery dates
- ✅ Order status tracking (Draft, Confirmed, Processing, Completed, Cancelled)
- ✅ Edit existing orders
- ✅ Confirm draft orders
- ✅ View detailed order information

### Statistics Displayed:
- Total Orders
- Draft Orders
- Confirmed Orders
- Total Order Value

### How to Create a Sales Order:
1. Click "New Sales Order"
2. Select a customer
3. Set delivery date (optional)
4. Add products:
   - Select product from dropdown
   - Enter quantity
   - Enter discount amount (optional)
   - Click "Add Item"
5. Add order notes (optional)
6. Review totals (Subtotal, Discount, Tax, Total)
7. Click "Create Order"

### Order Workflow:
Draft → Confirmed → Processing → Completed

---

## 2. Delivery Orders Tab

### Features:
- ✅ View all delivery orders linked to sales orders
- ✅ Track delivery status (Pending, In Transit, Delivered, Cancelled)
- ✅ Delivery address management
- ✅ Tracking number assignment
- ✅ Delivery date tracking
- ✅ Mark orders as "In Transit"
- ✅ Mark orders as "Delivered"
- ✅ View delivery details

### Statistics Displayed:
- Total Deliveries
- Pending Deliveries
- In Transit
- Delivered

### Delivery Workflow:
Pending → In Transit → Delivered

---

## 3. Sales Invoices Tab

### Features:
- ✅ Create invoices for customers
- ✅ Link invoices to sales orders (optional)
- ✅ Multiple payment terms (Net 7, 10, 15, 30, 60, Due on Receipt)
- ✅ Track payment status (Draft, Sent, Paid, Partial, Overdue)
- ✅ Amount paid and amount due tracking
- ✅ Send invoices to customers
- ✅ Mark invoices as paid
- ✅ Automatic calculations with tax and discounts

### Statistics Displayed:
- Total Invoices
- Paid Invoices
- Pending Invoices
- Overdue Invoices
- Total Amount Due

### How to Create an Invoice:
1. Click "New Invoice"
2. Select customer
3. Set due date
4. Choose payment terms
5. Add items with quantities and discounts
6. Add notes (optional)
7. Review totals
8. Click "Create Invoice"

### Invoice Workflow:
Draft → Sent → Paid (or Partial/Overdue)

---

## 4. Sales Returns Tab

### Features:
- ✅ Process product returns
- ✅ Link returns to invoices
- ✅ Track return reasons
- ✅ Return status management (Pending, Approved, Rejected, Refunded)
- ✅ Refund method selection (Cash, Card, Credit Note)
- ✅ Approve or reject returns
- ✅ Process refunds
- ✅ View return details

### Statistics Displayed:
- Total Returns
- Pending Returns
- Approved Returns
- Total Refunds Processed

### Return Workflow:
Pending → Approved/Rejected → Refunded (if approved)

### Common Return Reasons:
- Product defective
- Wrong size/color
- Customer changed mind
- Damaged in transit
- Not as described

---

## 5. Customer Receipts Tab

### Features:
- ✅ Record customer payments
- ✅ Link payments to specific invoices
- ✅ Payment on account (not linked to invoice)
- ✅ Multiple payment methods (Cash, Card, Online, Check, Bank Transfer)
- ✅ Reference number tracking
- ✅ Payment notes
- ✅ View receipt details

### Statistics Displayed:
- Total Receipts
- Total Amount Received
- Receipts This Month

### How to Record a Receipt:
1. Click "New Receipt"
2. Select customer
3. Select invoice (optional - can be payment on account)
4. Enter amount received
5. Select payment method
6. Enter reference number (e.g., check number, transaction ID)
7. Add notes (optional)
8. Click "Create Receipt"

### Payment Methods:
- **Cash** - Cash payments
- **Card** - Credit/Debit card payments
- **Online** - Online payment gateways
- **Check** - Check payments
- **Bank Transfer** - Direct bank transfers

---

## 6. Customer Management Tab

### Features:
- ✅ Complete customer database
- ✅ Add new customers
- ✅ Edit customer information
- ✅ Customer status management (Active/Inactive)
- ✅ Credit limit tracking
- ✅ Balance tracking
- ✅ Credit usage visualization
- ✅ Customer contact information
- ✅ Tax ID management
- ✅ View customer details

### Statistics Displayed:
- Total Customers
- Active Customers
- Inactive Customers
- Total Customer Balance

### Customer Information Tracked:
- Name
- Email
- Phone
- Address (Street, City, Country)
- Tax ID
- Credit Limit
- Current Balance
- Available Credit
- Status (Active/Inactive)
- Customer Since Date

### How to Add a Customer:
1. Click "New Customer"
2. Fill in customer details:
   - Name *
   - Email *
   - Phone *
   - Address *
   - City *
   - Country *
   - Tax ID (optional)
   - Credit Limit *
3. Click "Create Customer"

### Credit Management:
- **Credit Limit**: Maximum amount customer can owe
- **Current Balance**: Amount currently owed
- **Available Credit**: Credit Limit - Current Balance
- **Credit Usage Bar**: Visual indicator of credit utilization
  - Green: 0-50% usage
  - Yellow: 50-80% usage
  - Red: 80-100% usage

---

## Data Flow Between Modules

### Typical Sales Process:

1. **Customer Management**
   - Add customer to database
   - Set credit limit

2. **Sales Orders**
   - Create sales order for customer
   - Add products and quantities
   - Confirm order

3. **Delivery Orders**
   - Delivery order created from sales order
   - Mark as "In Transit"
   - Update with tracking number
   - Mark as "Delivered"

4. **Sales Invoices**
   - Create invoice (can link to sales order)
   - Send invoice to customer
   - Track payment status

5. **Customer Receipts**
   - Record payment received
   - Link to specific invoice
   - Update invoice status

6. **Sales Returns** (if needed)
   - Customer requests return
   - Create return linked to invoice
   - Approve/Reject return
   - Process refund if approved

---

## Search and Filter Capabilities

### All Tabs Include:
- **Search Bar**: Search by number, customer name, email, etc.
- **Status Filters**: Filter by status (varies by tab)
- **Real-time Filtering**: Results update as you type

---

## Color-Coded Status Badges

### Status Colors:
- 🟢 **Green (Success)**: Completed, Paid, Delivered, Refunded, Active, Approved
- 🟡 **Yellow (Warning)**: Draft, Pending, Sent
- 🔵 **Blue (Info)**: Confirmed, Processing, In Transit, Partial
- 🔴 **Red (Danger)**: Cancelled, Rejected, Overdue, Inactive

---

## Action Buttons

### Common Actions:
- 👁️ **View** (Eye icon): View detailed information
- ✏️ **Edit** (Pencil icon): Edit the record
- ✅ **Approve/Confirm** (Check icon): Approve or confirm
- 📤 **Send** (Send icon): Send invoice to customer
- 💵 **Mark Paid** (Dollar icon): Mark invoice as paid
- 🚚 **In Transit** (Truck icon): Mark delivery in transit
- ❌ **Reject/Cancel** (X icon): Reject or cancel
- 🗑️ **Delete** (Trash icon): Delete record

---

## Tips for Best Use

### Sales Orders:
- Always confirm draft orders before creating deliveries
- Use delivery dates to plan logistics
- Add detailed notes for special instructions

### Delivery Orders:
- Update tracking numbers for customer visibility
- Mark status changes promptly
- Use notes for delivery instructions

### Sales Invoices:
- Choose appropriate payment terms
- Send invoices promptly after delivery
- Monitor overdue invoices regularly

### Sales Returns:
- Document return reasons clearly
- Review returns before approving
- Process refunds promptly for approved returns

### Customer Receipts:
- Always enter reference numbers for tracking
- Link payments to invoices when possible
- Use notes to document payment details

### Customer Management:
- Set realistic credit limits
- Monitor credit usage regularly
- Keep contact information updated
- Deactivate inactive customers instead of deleting

---

## Keyboard Shortcuts

- **Esc**: Close any open modal
- **Click outside modal**: Close modal
- **Tab**: Navigate between form fields

---

## Data Persistence

**Important**: The current system uses in-memory mock data. All changes are temporary and will be lost when you refresh the page.

### For Production Use:
To make data persistent, you would need to:
1. Set up a backend API (Node.js, Python, etc.)
2. Connect to a database (PostgreSQL, MongoDB, MySQL, etc.)
3. Replace mock data imports with API calls
4. Implement authentication and authorization
5. Add data validation on the server side

---

## Future Enhancements

Potential additions for a production system:
- [ ] PDF generation for invoices and receipts
- [ ] Email integration for sending invoices
- [ ] SMS notifications for delivery updates
- [ ] Payment gateway integration
- [ ] Automated credit limit checks
- [ ] Customer portal for order tracking
- [ ] Advanced reporting and analytics
- [ ] Export to Excel/CSV
- [ ] Multi-currency support
- [ ] Tax calculation by region
- [ ] Automated late payment reminders
- [ ] Customer loyalty programs
- [ ] Batch operations (bulk actions)

---

## Technical Details

### Technologies Used:
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React useState hooks

### File Structure:
```
app/sales/page.tsx                      # Main sales page with tabs
components/sales/
  ├── SalesOrdersTab.tsx                # Sales orders management
  ├── DeliveryOrdersTab.tsx             # Delivery tracking
  ├── SalesInvoicesTab.tsx              # Invoice management
  ├── SalesReturnsTab.tsx               # Returns processing
  ├── CustomerReceiptsTab.tsx           # Payment recording
  └── CustomersTab.tsx                  # Customer database
data/salesData.ts                       # Mock data for sales features
types/index.ts                          # TypeScript type definitions
```

---

## Support

For questions or issues with the sales management system, refer to:
- Main README.md for general system information
- USER_GUIDE.md for overall system usage
- This document for sales-specific features

---

**Last Updated**: December 7, 2024
**Version**: 2.0 - Enhanced Sales Management
