# Inventory Management System

A comprehensive, modern inventory management system built with Next.js 14, featuring sales tracking, purchase orders, and real-time stock management.

## Features

### 📊 Dashboard
- Real-time statistics and KPIs
- Revenue and sales tracking
- Top-selling products analysis
- Low stock alerts
- Recent sales overview

### 📦 Product Management
- Complete product catalog
- Category-based organization
- Stock level monitoring
- Reorder level alerts
- Product search and filtering
- Add, edit, and delete products

### 💰 Sales Module
- Create and manage sales transactions
- Multi-item sales support
- Automatic tax calculations
- Discount management
- Multiple payment methods (Cash, Card, Online)
- Sales status tracking (Pending, Completed, Cancelled)
- Detailed sales reports

### 🛒 Purchase Module
- Purchase order management
- Supplier tracking
- Multi-item purchase orders
- Automatic tax calculations
- Payment status tracking
- Order status management (Pending, Received, Cancelled)

### 📈 Stock Management
- Real-time stock level monitoring
- Stock movement tracking (In, Out, Adjustments)
- Stock value calculations
- Low stock and out-of-stock alerts
- Movement history with references
- Comprehensive stock reports

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Design**: Glassmorphism with dark theme

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard
│   ├── products/          # Product management
│   ├── sales/             # Sales module
│   ├── purchases/         # Purchase module
│   ├── stock/             # Stock management
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── StatCard.tsx       # Statistics card
│   └── Modal.tsx          # Modal component
├── data/                  # Mock data
│   └── mockData.ts        # Sample data
├── types/                 # TypeScript types
│   └── index.ts           # Type definitions
└── public/                # Static assets
```

## Features in Detail

### Dashboard
- **Revenue Tracking**: Monitor total revenue with percentage changes
- **Sales Analytics**: Track completed sales and trends
- **Purchase Overview**: View total purchases and spending
- **Low Stock Alerts**: Get notified about products needing reorder
- **Top Products**: See best-selling items by revenue

### Product Management
- **Grid View**: Modern card-based product display
- **Search & Filter**: Find products by name, SKU, or category
- **Stock Indicators**: Visual alerts for low stock items
- **Quick Actions**: Edit or delete products with one click
- **Detailed Forms**: Comprehensive product information capture

### Sales Module
- **Multi-Item Sales**: Add multiple products to a single sale
- **Auto Calculations**: Automatic subtotal, tax, and total calculations
- **Customer Tracking**: Store customer information with each sale
- **Payment Methods**: Support for cash, card, and online payments
- **Status Management**: Track sales from pending to completed

### Purchase Module
- **Supplier Management**: Track purchases by supplier
- **Order Status**: Monitor pending and received orders
- **Payment Tracking**: Manage payment status (Unpaid, Partial, Paid)
- **Cost Tracking**: Monitor purchase costs and totals
- **Receive Orders**: Mark orders as received when inventory arrives

### Stock Management
- **Real-Time Levels**: View current stock for all products
- **Movement History**: Track all stock changes with reasons
- **Value Calculations**: Monitor total inventory value
- **Status Indicators**: Color-coded alerts for stock levels
- **Manual Adjustments**: Record stock adjustments with references

## Design Features

- **Glassmorphism**: Modern frosted glass effect
- **Dark Theme**: Easy on the eyes with vibrant accents
- **Responsive**: Works on desktop, tablet, and mobile
- **Animations**: Smooth transitions and micro-interactions
- **Color Coding**: Intuitive status indicators
- **Premium UI**: Professional, polished interface

## Data Management

The system currently uses mock data stored in `data/mockData.ts`. To integrate with a real backend:

1. Replace mock data imports with API calls
2. Implement state management (Redux, Zustand, etc.)
3. Add authentication and authorization
4. Connect to a database (PostgreSQL, MongoDB, etc.)
5. Implement real-time updates with WebSockets

## Future Enhancements

- [ ] User authentication and roles
- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Export to PDF/Excel
- [ ] Barcode scanning
- [ ] Multi-location support
- [ ] Automated reordering
- [ ] Integration with accounting software
- [ ] Mobile app version
- [ ] API documentation

## License

This project is created for demonstration purposes.

## Support

For questions or support, please contact the development team.
