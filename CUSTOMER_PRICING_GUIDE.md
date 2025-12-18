# Customer-Specific Pricing Feature

## Overview
The Delivery Orders module now supports **customer-specific pricing**, allowing you to set special prices for individual customers on specific products. This feature enables you to offer discounts, volume pricing, or special rates to valued customers.

## How It Works

### 1. **Setting Customer-Specific Prices**
Customer-specific prices are defined in the customer data (`data/salesData.ts`). Each customer can have a `customerPrices` object that maps product IDs to custom prices.

**Example:**
```typescript
{
    id: '1',
    name: 'John Smith',
    customerPrices: {
        '1': 139.99, // Special price for Wireless Bluetooth Headphones (Regular: $149.99)
        '3': 22.99,  // Special price for Cotton T-Shirt (Regular: $24.99)
    },
}
```

### 2. **Current Customer Pricing**

#### John Smith
- **Wireless Bluetooth Headphones**: $139.99 (Save $10.00 from regular $149.99)
- **Cotton T-Shirt**: $22.99 (Save $2.00 from regular $24.99)

#### Sarah Johnson
- **Smart Watch Pro**: $279.99 (Save $20.00 from regular $299.99)
- **Denim Jeans**: $54.99 (Save $5.00 from regular $59.99)

#### Emily Davis
- **Organic Coffee Beans**: $16.99/kg (Save $2.00 from regular $18.99/kg)
- **Protein Powder**: $44.99/kg (Save $5.00 from regular $49.99/kg)

### 3. **Using Customer-Specific Pricing in Delivery Orders**

When creating a delivery order:

1. **Select a Customer**: Choose the customer from the dropdown
2. **Add Items**: When you select products, the system automatically:
   - Checks if the customer has a special price for that product
   - Displays the special price in the product dropdown
   - Shows both the special price and regular price for comparison
   - Applies the special price to the order

**Product Dropdown Format:**
```
Product Name - $XX.XX (Special Price, Reg: $YY.YY) | Stock: ZZ uom
```

3. **Review Items**: The delivery items list shows:
   - Product name
   - Quantity with UOM (Unit of Measurement)
   - Unit price (customer-specific if applicable)
   - Total price calculation

**Example Display:**
```
Wireless Bluetooth Headphones
Quantity: 2 pcs × $139.99 = $279.98
```

### 4. **Visual Indicators**

- **Blue Info Message**: When a customer is selected, you'll see: 
  > 💡 Customer-specific prices will be applied automatically

- **Price Comparison**: Products with special prices show both prices:
  > Wireless Bluetooth Headphones - $139.99 (Special Price, Reg: $149.99)

- **Standard Pricing**: Products without special prices show only the regular price:
  > Yoga Mat - $34.99 | Stock: 62 pcs

## Benefits

✅ **Automatic Application**: No manual price adjustments needed
✅ **Transparency**: Users can see both special and regular prices
✅ **Flexibility**: Different customers can have different prices for the same product
✅ **Accuracy**: Reduces pricing errors and ensures consistency
✅ **Customer Loyalty**: Reward valued customers with special pricing

## Technical Implementation

### Type Definition
```typescript
export interface Customer {
    // ... other fields
    customerPrices?: { [productId: string]: number };
}
```

### Price Resolution Logic
```typescript
const customer = customers.find(c => c.id === formData.customerId);
const itemPrice = customer?.customerPrices?.[product.id] ?? product.price;
```

The system uses the **nullish coalescing operator (`??`)** to:
1. Check if customer has custom pricing for the product
2. Use custom price if available
3. Fall back to standard product price if not

## Future Enhancements

Potential improvements for this feature:
- Price history tracking
- Bulk price management interface
- Price expiration dates
- Tiered pricing based on quantity
- Import/export customer pricing
- Price approval workflows
- Discount percentage instead of fixed prices

## Notes

- Customer-specific prices override standard product prices
- Prices are applied automatically when adding items to delivery orders
- The feature works for direct deliveries (not linked to sales orders)
- UOM (Unit of Measurement) is displayed for clarity
- All prices are stored and displayed in the system's base currency

---

**Last Updated**: December 9, 2024
**Feature Status**: ✅ Active and Functional
