import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesInvoice } from '@/types';

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

export const generateInvoicePDF = async (invoice: SalesInvoice) => {
    // Create new jsPDF instance: unit=mm, format=[width, height]
    // A5 Landscape: 210mm x 148mm
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [148, 210] // [height, width] for landscape A5 or just 'a5' with orientation 'landscape'
    });

    // --- Colors & Styling ---
    const primaryColor: [number, number, number] = [41, 128, 185]; // Professional Blue
    const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark Slate
    const accentColor: [number, number, number] = [127, 140, 141]; // Grey
    const textColor: [number, number, number] = [44, 62, 80];

    // --- Header ---
    // Company Logo
    try {
        // Since we are in a browser, we try to load the image and convert to base64
        // We use a relative path. If the image is in /public/assets, it works.
        // If it's served from the dev server correctly.
        const logoData = await loadImage('/assets/company_logo.jpeg');
        doc.addImage(logoData, 'JPEG', 10, 8, 25, 25);
    } catch (e) {
        console.error("Could not load logo", e);
        // Fallback or just ignore
    }

    doc.setFontSize(22);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Thaha Plastic Industries', 40, 15);

    doc.setFontSize(9);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('No: 05, Muhandiram Lane, Colombo-12', 40, 20);
    doc.text('Phone: 0112247476 / 0773500852', 40, 24);
    doc.text('Email: info@thaha-inventory.com', 40, 28);

    // Conditional Title and Tax Number
    const isTaxInvoice = invoice.orderType === 'Tax';
    const title = isTaxInvoice ? 'TAX INVOICE' : 'INVOICE';

    doc.setFontSize(18);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 200, 15, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');

    if (isTaxInvoice) {
        doc.setFont('helvetica', 'bold');
        doc.text('Tax Registration No:', 200, 20, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text('409009670-7000', 200, 24, { align: 'right' });

        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 200, 30, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 200, 34, { align: 'right' });
        // invoice.dueDate && doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 200, 38, { align: 'right' });
    } else {
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 200, 20, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 200, 24, { align: 'right' });
        // invoice.dueDate && doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 200, 28, { align: 'right' });
    }

    // --- Client Information ---
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    const lineY = isTaxInvoice ? 42 : 32;
    doc.line(10, lineY, 200, lineY);

    const clientY = lineY + 8;
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 10, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customerName, 10, clientY + 5);

    // Attempt to get more customer info if available
    const customer: any = (invoice as any).Customer;
    if (customer) {
        if (customer.address) doc.text(customer.address, 10, 49);
        if (customer.city) doc.text(customer.city, 10, 53);
        if (customer.phone) doc.text(`Phone: ${customer.phone}`, 10, 57);
    } else {
        doc.text('Customer Details', 10, 49);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE TYPE:', 150, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.orderType || 'General', 150, 45);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT TERMS:', 150, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.paymentTerms || 'Net 30', 150, 55);

    // --- Table ---
    const tableData = invoice.items.map((item, index) => [
        index + 1,
        item.Product?.name || item.productName || 'Unknown',
        item.Product?.uom || item.uom || 'pcs',
        item.quantity,
        `LKR ${item.price.toFixed(2)}`,
        item.discount > 0 ? `LKR ${item.discount.toFixed(2)}` : '0.00',
        `LKR ${item.total.toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 65,
        head: [['#', 'Description', 'UOM', 'Qty', 'Unit Price', 'Discount', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: secondaryColor,
            textColor: [255, 255, 255],
            fontSize: 9,
            cellPadding: 2
        },
        bodyStyles: {
            fontSize: 8,
            cellPadding: 1.5
        },
        alternateRowStyles: {
            fillColor: [245, 246, 250]
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' },
            5: { cellWidth: 30, halign: 'right' },
            6: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: 10, right: 10 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // --- Totals ---
    const leftX = 140;
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    doc.text('Subtotal:', leftX, finalY);
    doc.text(`LKR ${invoice.subtotal.toFixed(2)}`, 200, finalY, { align: 'right' });

    doc.text('Discount:', leftX, finalY + 5);
    doc.text(`- LKR ${invoice.discount.toFixed(2)}`, 200, finalY + 5, { align: 'right' });

    doc.text('Tax (10%):', leftX, finalY + 10);
    doc.text(`LKR ${invoice.tax.toFixed(2)}`, 200, finalY + 10, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Total Amount:', leftX, finalY + 18);
    doc.text(`LKR ${invoice.total.toFixed(2)}`, 200, finalY + 18, { align: 'right' });

    // --- Footer & Notes ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);

    if (invoice.notes) {
        doc.text('NOTES:', 10, finalY);
        doc.text(invoice.notes, 10, finalY + 4, { maxWidth: 120 });
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.text('Thank you for your business!', 105, pageHeight - 10, { align: 'center' });
    doc.text('Generated by Thaha Plastic Industries', 105, pageHeight - 6, { align: 'center' });

    // --- Save PDF ---
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};
