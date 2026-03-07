import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesInvoice, DeliveryOrder } from '@/types';

const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
            } else {
                reject(new Error('Failed to get canvas context'));
            }
        };
        img.onerror = (e) => reject(e);
    });
};

// ─── INVOICE PDF ─────────────────────────────────────────────────────────────
// 216mm wide × 140mm tall (≈ 8.5” × 5.5”) — cut line at 140mm
// NOTE: jsPDF swaps [w,h] when w>h in portrait mode, so 'landscape' + [140,216]
//       is the only way to get a page that is exactly 216mm wide × 140mm tall.
export const generateInvoicePDF = async (invoice: SalesInvoice) => {
    const PAGE_W = 216;   // landscape width
    const PAGE_H = 140;   // landscape height — cut line is here
    const ML = 8;         // left margin
    const MR = PAGE_W - 8; // right margin (208mm)

    const doc = new jsPDF({
        orientation: 'landscape',  // required: jsPDF swaps w/h in portrait when w>h
        unit: 'mm',
        format: [140, 216]   // [shorter, longer] → jsPDF produces 216mm wide × 140mm tall
    });

    doc.setLineWidth(0.3);
    const BLACK: [number, number, number] = [0, 0, 0];

    // ──────────── HEADER ────────────────────────────────────────────────────
    try {
        const logoData = await loadImage('/assets/company_logo.jpeg');
        doc.addImage(logoData, 'JPEG', ML, 3, 22, 22);
    } catch (e) {
        console.error('Could not load logo', e);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...BLACK);
    doc.text('Thaha Plastic Industries', 32, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BLACK);
    doc.text('No: 05, Muhandiram Lane, Colombo-12', 32, 16);
    doc.text('Phone: 0112247476 / 0773500852', 32, 21);
    doc.text('Email: thahaplastics@gmail.com', 32, 26);

    // Title (right side)
    const isTax = invoice.orderType === 'Tax';
    const title = isTax ? 'TAX INVOICE' : 'INVOICE';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...BLACK);
    doc.text(title, MR, 10, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BLACK);
    let rightY = 17;
    if (isTax) {
        doc.setFont('helvetica', 'bold');
        doc.text('Tax Reg No:', MR, rightY, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        rightY += 5;
        doc.text('409009670-7000', MR, rightY, { align: 'right' });
        rightY += 5;
    }
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, MR, rightY, { align: 'right' });
    rightY += 5;
    doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, MR, rightY, { align: 'right' });

    // ──────────── SEPARATOR ──────────────────────────────────────────────────
    const lineY = 32;
    doc.setDrawColor(...BLACK);
    doc.setLineWidth(0.3);
    doc.line(ML, lineY, MR, lineY);

    // ──────────── BILL TO ────────────────────────────────────────────────────
    const billY = lineY + 5;
    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('BILL TO:', ML, billY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.text(invoice.customerName || 'Unknown', ML + 18, billY);

    const customer: any = (invoice as any).Customer;
    if (customer) {
        const addr = [customer.address, customer.city].filter(Boolean).join(', ');
        if (addr) doc.text(addr, ML + 18, billY + 5);
        if (customer.phone) doc.text(`Phone: ${customer.phone}`, ML + 18, billY + 10);
    }

    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT TERMS:', MR - 45, billY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.paymentTerms || 'Net 30', MR - 45, billY + 5);

    // ──────────── ITEMS TABLE ────────────────────────────────────────────────
    const tableData = invoice.items.map((item, i) => [
        i + 1,
        (item.Product?.name || item.productName || 'Unknown') + (item.colorName ? ` - ${item.colorName}` : ''),
        item.quantity,
        item.Product?.uom || item.uom || 'pcs',
        `${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
        startY: billY + 15,
        head: [['#', 'Description', 'Qty', 'UOM', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.3
        },
        bodyStyles: {
            fontSize: 8,
            fontStyle: 'normal',
            textColor: [0, 0, 0],
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.3
        },
        columnStyles: {
            0: { cellWidth: 8, textColor: [0, 0, 0] },
            1: { cellWidth: 'auto', textColor: [0, 0, 0] },
            2: { cellWidth: 13, halign: 'center', textColor: [0, 0, 0] },
            3: { cellWidth: 13, halign: 'center', textColor: [0, 0, 0] },
            4: { cellWidth: 30, halign: 'right', textColor: [0, 0, 0] },
            5: { cellWidth: 30, halign: 'right', textColor: [0, 0, 0] }
        },
        // bottom margin reserves space for totals block on the same page
        margin: { left: ML, right: PAGE_W - MR, bottom: 28 },
        tableWidth: MR - ML,
        didDrawPage: (data: any) => {
            // Repeat header on every overflow page
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(7);
            doc.text('Thank you for your business!', PAGE_W / 2, PAGE_H - 4, { align: 'center' });
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 4;

    // If totals block won't fit (needs ~28mm), push to next page
    if (finalY > PAGE_H - 28) {
        doc.addPage();
        finalY = 10;
    }

    // ──────────── TOTALS ─────────────────────────────────────────────────────
    doc.setTextColor(...BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', MR - 42, finalY);
    doc.text(`${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, MR, finalY, { align: 'right' });

    if (invoice.tax > 0) {
        doc.text('Tax:', MR - 42, finalY + 6);
        doc.text(`${invoice.tax.toFixed(2)}`, MR, finalY + 6, { align: 'right' });
        finalY += 6;
    }

    if (invoice.discount > 0) {
        doc.text('Discount:', MR - 42, finalY + 12);
        doc.text(`${invoice.discount.toFixed(2)}`, MR, finalY + 12, { align: 'right' });
        finalY += 6;
    }

    doc.setDrawColor(...BLACK);
    doc.setLineWidth(0.3);
    doc.line(MR - 52, finalY + 13, MR, finalY + 13);

    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total:', MR - 42, finalY + 19);
    doc.text(`${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, MR, finalY + 19, { align: 'right' });

    // Notes (left side, same row as totals)
    if (invoice.notes) {
        doc.setTextColor(...BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('NOTES:', ML, finalY);
        doc.setFont('helvetica', 'normal');
        doc.text(invoice.notes, ML, finalY + 6, { maxWidth: 100 });
    }

    // Footer — pinned to bottom of last page
    doc.setTextColor(...BLACK);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', PAGE_W / 2, PAGE_H - 4, { align: 'center' });

    // ──────────── PRINT ──────────────────────────────────────────────────────
    doc.autoPrint();
    const hiddFrame = document.createElement('iframe');
    hiddFrame.style.cssText = 'position:fixed;width:1px;height:1px;top:-1px;left:-1px;';
    hiddFrame.src = URL.createObjectURL(doc.output('blob'));
    document.body.appendChild(hiddFrame);
    hiddFrame.onload = () => {
        hiddFrame.contentWindow?.print();
        setTimeout(() => document.body.removeChild(hiddFrame), 5000);
    };

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};

// ─── DELIVERY ORDER PDF ───────────────────────────────────────────────────────
// HalfLetter Landscape: 216mm wide × 140mm tall
export const generateDeliveryOrderPDF = async (delivery: DeliveryOrder) => {
    const PAGE_W = 216;
    const PAGE_H = 140;
    const ML = 8;
    const MR = PAGE_W - 8;

    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [PAGE_H, PAGE_W]
    });

    doc.setLineWidth(0.3);

    const BLACK: [number, number, number] = [0, 0, 0];

    // ──────────── HEADER ────────────────────────────────────────────────────
    try {
        const logoData = await loadImage('/assets/company_logo.jpeg');
        doc.addImage(logoData, 'JPEG', ML, 3, 22, 22);
    } catch (e) {
        console.error('Could not load logo', e);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...BLACK);
    doc.text('Thaha Plastic Industries', 32, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('No: 05, Muhandiram Lane, Colombo-12', 32, 16);
    doc.text('Phone: 0112247476 / 0773500852', 32, 21);
    doc.text('Email: thahaplastics@gmail.com', 32, 26);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('DELIVERY ORDER', MR, 10, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`DO #: ${delivery.deliveryNumber}`, MR, 18, { align: 'right' });
    const doDate = delivery.deliveryDate
        ? new Date(delivery.deliveryDate).toLocaleDateString()
        : new Date(delivery.createdAt).toLocaleDateString();
    doc.text(`Date: ${doDate}`, MR, 24, { align: 'right' });

    // ──────────── SEPARATOR ──────────────────────────────────────────────────
    const lineY = 32;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(ML, lineY, MR, lineY);

    // ──────────── DELIVER TO ─────────────────────────────────────────────────
    const infoY = lineY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DELIVER TO:', ML, infoY);

    doc.setFont('helvetica', 'normal');
    doc.text(delivery.customerName || 'Unknown', ML + 23, infoY);
    if (delivery.deliveryAddress) {
        doc.text(delivery.deliveryAddress, ML + 23, infoY + 5, { maxWidth: 80 });
    }

    if (delivery.trackingNumber) {
        doc.setFont('helvetica', 'bold');
        doc.text('TRACKING #:', MR - 45, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(delivery.trackingNumber, MR - 45, infoY + 5);
    }

    // ──────────── ITEMS TABLE ────────────────────────────────────────────────
    const tableData = delivery.items.map((item, i) => [
        i + 1,
        (item.Product?.name || item.productName || 'Unknown') + (item.colorName ? ` - ${item.colorName}` : ''),
        item.quantity,
        item.Product?.uom || item.uom || 'pcs',
        item.notes || ''
    ]);

    const tableStartY = infoY + 14;

    autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Description', 'Qty', 'UOM', 'Remarks']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.3
        },
        bodyStyles: {
            fontSize: 8,
            fontStyle: 'normal',
            textColor: [0, 0, 0],
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.3
        },
        columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 14, halign: 'center' },
            3: { cellWidth: 14, halign: 'center' },
            4: { cellWidth: 35 }
        },
        margin: { left: ML, right: PAGE_W - MR, bottom: 20 },
        tableWidth: MR - ML,
        didDrawPage: () => {
            doc.setFontSize(6);
            doc.setFont('helvetica', 'normal');
            doc.text('Thaha Plastic Industries', PAGE_W / 2, PAGE_H - 3, { align: 'center' });
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 6;

    // If too close to bottom for signatures, new page
    if (finalY > PAGE_H - 25) {
        doc.addPage();
        finalY = 10;
    }

    // ──────────── SIGNATURES ─────────────────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Signature:', ML, finalY);
    doc.setLineWidth(0.3);
    doc.line(ML, finalY + 10, ML + 50, finalY + 10);

    doc.text('Prepared By:', MR - 55, finalY);
    doc.line(MR - 55, finalY + 10, MR, finalY + 10);

    if (delivery.notes) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('NOTES:', ML, finalY + 16);
        doc.setFont('helvetica', 'normal');
        doc.text(delivery.notes, ML + 14, finalY + 16, { maxWidth: 100 });
    }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Thaha Plastic Industries', PAGE_W / 2, PAGE_H - 5, { align: 'center' });

    // ──────────── PRINT ──────────────────────────────────────────────────────
    doc.autoPrint();
    const hiddFrame = document.createElement('iframe');
    hiddFrame.style.cssText = 'position:fixed;width:1px;height:1px;top:-1px;left:-1px;';
    hiddFrame.src = URL.createObjectURL(doc.output('blob'));
    document.body.appendChild(hiddFrame);
    hiddFrame.onload = () => {
        hiddFrame.contentWindow?.print();
        setTimeout(() => document.body.removeChild(hiddFrame), 5000);
    };

    doc.save(`DeliveryOrder_${delivery.deliveryNumber}.pdf`);
};
