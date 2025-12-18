# Sales Module Enhancement - Table View for Line Items

## Overview
This document outlines the changes needed to display line items in a professional table format in Sales Orders and Delivery Orders.

## Required Changes

### 1. Update Mock Data (salesData.ts)
Add `uom` field to all EnhancedSaleItem entries:

```typescript
{
    productId: '1',
    productName: 'Wireless Bluetooth Headphones',
    uom: 'pcs', // ADD THIS
    quantity: 2,
    price: 149.99,
    discount: 0,
    tax: 30.00,
    total: 329.98,
}
```

### 2. Update Sales Orders Tab - Item Display Section

Replace the current item list display with a table:

**Current (Simple List):**
```tsx
{orderItems.map((item) => (
  <div key={item.productId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
    <div className="flex-1">
      <p className="font-medium text-white">{item.productName}</p>
      <p className="text-sm text-gray-400">{item.quantity} × ${item.price.toFixed(2)}</p>
    </div>
    <p className="font-bold text-white">${item.total.toFixed(2)}</p>
  </div>
))}
```

**New (Professional Table):**
```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-white/10">
        <th className="text-left text-sm font-medium text-gray-400 pb-3">Item Name</th>
        <th className="text-center text-sm font-medium text-gray-400 pb-3">UOM</th>
        <th className="text-right text-sm font-medium text-gray-400 pb-3">Price</th>
        <th className="text-right text-sm font-medium text-gray-400 pb-3">Qty</th>
        <th className="text-right text-sm font-medium text-gray-400 pb-3">Discount</th>
        <th className="text-right text-sm font-medium text-gray-400 pb-3">Disc. Price</th>
        <th className="text-right text-sm font-medium text-gray-400 pb-3">Value</th>
        <th className="text-center text-sm font-medium text-gray-400 pb-3">Action</th>
      </tr>
    </thead>
    <tbody>
      {orderItems.map((item) => {
        const discountedPrice = item.price - (item.discount / item.quantity);
        const lineValue = item.quantity * discountedPrice;
        
        return (
          <tr key={item.productId} className="border-b border-white/5">
            <td className="py-3 text-white">{item.productName}</td>
            <td className="py-3 text-center text-gray-300">{item.uom}</td>
            <td className="py-3 text-right text-gray-300">${item.price.toFixed(2)}</td>
            <td className="py-3 text-right text-white font-semibold">{item.quantity}</td>
            <td className="py-3 text-right text-yellow-400">${item.discount.toFixed(2)}</td>
            <td className="py-3 text-right text-green-400">${discountedPrice.toFixed(2)}</td>
            <td className="py-3 text-right text-white font-bold">${lineValue.toFixed(2)}</td>
            <td className="py-3 text-center">
              <button
                type="button"
                onClick={() => handleRemoveItem(item.productId)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
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
```

### 3. Update handleAddItem Function

Ensure UOM is included when adding items:

```typescript
const handleAddItem = () => {
  if (!selectedProduct || !quantity) return;

  const product = products.find(p => p.id === selectedProduct);
  if (!product) return;

  const qty = parseInt(quantity);
  const disc = parseFloat(discount) || 0;
  const itemSubtotal = qty * product.price;
  const itemTax = (itemSubtotal - disc) * 0.1;
  const itemTotal = itemSubtotal - disc + itemTax;

  setOrderItems([...orderItems, {
    productId: product.id,
    productName: product.name,
    uom: product.uom, // ADD THIS LINE
    quantity: qty,
    price: product.price,
    discount: disc,
    tax: itemTax,
    total: itemTotal,
  }]);

  setSelectedProduct('');
  setQuantity('1');
  setDiscount('0');
};
```

### 4. Apply Same Changes to:
- Delivery Orders Tab (`DeliveryOrdersTab.tsx`)
- Sales Invoices Tab (`SalesInvoicesTab.tsx`)
- Sales Returns Tab (`SalesReturnsTab.tsx`)

### 5. View Modal Updates

Update the view modals to also show items in table format:

```tsx
<div className="border-t border-white/10 pt-6">
  <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left text-sm font-medium text-gray-400 pb-2">Item</th>
          <th className="text-center text-sm font-medium text-gray-400 pb-2">UOM</th>
          <th className="text-right text-sm font-medium text-gray-400 pb-2">Price</th>
          <th className="text-right text-sm font-medium text-gray-400 pb-2">Qty</th>
          <th className="text-right text-sm font-medium text-gray-400 pb-2">Discount</th>
          <th className="text-right text-sm font-medium text-gray-400 pb-2">Total</th>
        </tr>
      </thead>
      <tbody>
        {viewingOrder.items.map((item, index) => (
          <tr key={index} className="border-b border-white/5">
            <td className="py-2 text-white">{item.productName}</td>
            <td className="py-2 text-center text-gray-300">{item.uom}</td>
            <td className="py-2 text-right text-gray-300">${item.price.toFixed(2)}</td>
            <td className="py-2 text-right text-white">{item.quantity}</td>
            <td className="py-2 text-right text-yellow-400">${item.discount.toFixed(2)}</td>
            <td className="py-2 text-right text-white font-bold">${item.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

## Column Definitions

| Column | Description | Calculation |
|--------|-------------|-------------|
| Item Name | Product name | From product |
| UOM | Unit of Measurement | From product (pcs, kg, ltr, etc.) |
| Item Price | Base price per unit | From product |
| Qty | Quantity ordered | User input |
| Discount | Total discount for line | User input |
| Discounted Price | Price after discount per unit | `price - (discount / quantity)` |
| Value | Total line value | `quantity × discounted_price` |

## Benefits

1. **Professional Appearance**: Table format is standard for business applications
2. **Clear Data Presentation**: All information visible at a glance
3. **Easy Scanning**: Headers make it easy to find specific information
4. **Calculation Transparency**: Users can see how totals are calculated
5. **Responsive**: Table scrolls horizontally on mobile devices

## Implementation Priority

1. ✅ Types updated (Product and EnhancedSaleItem with UOM)
2. ✅ Mock data updated (Products with UOM)
3. ⏳ Sales Orders Tab - Item table view
4. ⏳ Delivery Orders Tab - Item table view
5. ⏳ Sales Invoices Tab - Item table view
6. ⏳ Sales Returns Tab - Item table view
7. ⏳ Update salesData.ts with UOM for all items

## Next Steps

The developer should:
1. Update all EnhancedSaleItem entries in salesData.ts to include UOM
2. Replace item list displays with table format in all sales tabs
3. Test calculations to ensure discounted price and value are correct
4. Verify responsive behavior on mobile devices
