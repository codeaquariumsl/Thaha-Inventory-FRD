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

export const generateInvoicePDF = async (invoice: SalesInvoice) => {
    // ... (existing code)
    // Create new jsPDF instance: unit=mm, format=[width, height]
    // A5 landscape: 210mm x 148mm portrait
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [297, 210]
    });

    // --- Colors & Styling ---
    const primaryColor: [number, number, number] = [0, 0, 0];//[41, 128, 185]; // Professional Blue
    const secondaryColor: [number, number, number] = [0, 0, 0];//[52, 73, 94]; // Dark Slate
    const accentColor: [number, number, number] = [0, 0, 0];//[127, 140, 141]; // Grey
    const textColor: [number, number, number] = [0, 0, 0];//[44, 62, 80];

    // --- Header ---
    // Company Logo
    try {
        const logoData = await loadImage('/assets/company_logo.jpeg');
        doc.addImage(logoData, 'JPEG', 10, 0, 25, 25);
    } catch (e) {
        console.error("Could not load logo", e);
    }

    doc.setFontSize(22);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Thaha Plastic Industries', 40, 10);

    doc.setFontSize(9);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('No: 05, Muhandiram Lane, Colombo-12', 40, 15);
    doc.text('Phone: 0112247476 / 0773500852', 40, 19);
    doc.text('Email: thahaplastics@gmail.com', 40, 23);

    // Conditional Title and Tax Number
    const isTaxInvoice = invoice.orderType === 'Tax';
    const title = isTaxInvoice ? 'TAX INVOICE' : 'INVOICE';

    doc.setFontSize(18);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 200, 10, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');

    if (isTaxInvoice) {
        doc.setFont('helvetica', 'bold');
        doc.text('Tax Registration No:', 200, 15, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text('409009670-7000', 200, 19, { align: 'right' });

        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 200, 25, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 200, 29, { align: 'right' });
    } else {
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 200, 20, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 200, 24, { align: 'right' });
    }

    // --- Client Information ---
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    const lineY = isTaxInvoice ? 35 : 25;
    doc.line(10, lineY, 200, lineY);

    const clientY = lineY + 5;
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 10, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customerName, 30, clientY);

    const customer: any = (invoice as any).Customer;
    if (customer) {
        let address = "";
        let phone = "";
        if (customer.address) address += customer.address;
        if (customer.city) address += ", " + customer.city;
        if (customer.phone) phone = `Phone: ${customer.phone}`;
        doc.text(address, 30, clientY + 5);
        doc.text(phone, 30, clientY + 10);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT TERMS:', 150, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.paymentTerms || 'Net 30', 150, clientY + 5);

    // --- Table ---
    const tableData = invoice.items.map((item, index) => [
        index + 1,
        (item.Product?.name || item.productName || 'Unknown') + (item.colorName ? ` - ${item.colorName}` : ''),
        item.quantity,
        item.Product?.uom || item.uom || 'pcs',
        `LKR ${item.price.toFixed(2)}`,
        // item.discount > 0 ? `LKR ${item.discount.toFixed(2)}` : '0.00',
        `LKR ${item.total.toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 45,
        head: [['#', 'Description', 'Qty', 'UOM', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 2,
            lineColor: [41, 128, 185],
            lineWidth: 0.3
        },
        bodyStyles: {
            fontSize: 10,
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            cellPadding: 2,
            lineColor: [41, 128, 185],
            lineWidth: 0.3
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' },
            5: { cellWidth: 30, halign: 'right' }
        },
        tableWidth: 190,
        margin: { left: 10, right: 10 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 150, finalY);
    doc.text(`LKR ${invoice.subtotal.toFixed(2)}`, 200, finalY, { align: 'right' });

    doc.text('Tax:', 150, finalY + 6);
    doc.text(`LKR ${invoice.tax.toFixed(2)}`, 200, finalY + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 150, finalY + 12);
    doc.text(`LKR ${invoice.total.toFixed(2)}`, 200, finalY + 12, { align: 'right' });

    if (invoice.notes) {
        doc.text('NOTES:', 10, finalY);
        doc.text(invoice.notes, 10, finalY + 4, { maxWidth: 120 });
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });
    // doc.text('Generated by Thaha Plastic Industries', 105, finalY + 24, { align: 'center' });

    // Auto print logic
    doc.autoPrint();
    const hiddFrame = document.createElement('iframe');
    hiddFrame.style.position = 'fixed';
    hiddFrame.style.width = '1px';
    hiddFrame.style.height = '1px';
    hiddFrame.style.top = '-1px';
    hiddFrame.style.left = '-1px';
    const blob = doc.output('blob');
    hiddFrame.src = URL.createObjectURL(blob);
    document.body.appendChild(hiddFrame);

    // Some browsers might need a small delay or onload
    hiddFrame.onload = () => {
        if (hiddFrame.contentWindow) {
            hiddFrame.contentWindow.print();
            // Remove the iframe after a delay to ensure printing is initiated
            setTimeout(() => {
                document.body.removeChild(hiddFrame);
            }, 5000);
        }
    };

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};

export const generateDeliveryOrderPDF = async (delivery: DeliveryOrder) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [297, 210]
    });

    const primaryColor: [number, number, number] = [0, 0, 0];//[41, 128, 185];
    const secondaryColor: [number, number, number] = [0, 0, 0];//[52, 73, 94];
    const accentColor: [number, number, number] = [0, 0, 0];//[127, 140, 141];
    const textColor: [number, number, number] = [0, 0, 0];//[44, 62, 80];

    try {
        const logoData = await loadImage('/assets/company_logo.jpeg');
        doc.addImage(logoData, 'JPEG', 10, 0, 25, 25);
    } catch (e) {
        console.error("Could not load logo", e);
    }

    doc.setFontSize(22);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Thaha Plastic Industries', 40, 10);

    doc.setFontSize(9);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('No: 05, Muhandiram Lane, Colombo-12', 40, 15);
    doc.text('Phone: 0112247476 / 0773500852', 40, 19);
    doc.text('Email: thahaplastics@gmail.com', 40, 23);

    doc.setFontSize(18);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY ORDER', 200, 10, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`DO #: ${delivery.deliveryNumber}`, 200, 19, { align: 'right' });
    // doc.text(`Order #: ${delivery.salesOrderNumber}`, 200, 19, { align: 'right' });
    doc.text(`Date: ${delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : new Date(delivery.createdAt).toLocaleDateString()}`, 200, 23, { align: 'right' });

    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.line(10, 25, 200, 25);

    doc.setFont('helvetica', 'bold');
    doc.text('DELIVER TO:', 10, 30);
    doc.setFont('helvetica', 'normal');
    doc.text(delivery.customerName, 40, 30);

    const customer: any = delivery.deliveryAddress;
    if (customer) {
        let address = "";
        let phone = "";
        if (customer.address) address += customer.address;
        if (customer.city) address += ", " + customer.city;
        if (customer.phone) phone = `Phone: ${customer.phone}`;
        doc.text(address, 40, 35);
        if (phone) {
            doc.text(phone, 40, 40);
        }
    }

    // doc.setFont('helvetica', 'bold');
    // doc.text('ORDER TYPE:', 150, 43);
    // doc.setFont('helvetica', 'normal');
    // doc.text(delivery.orderType || 'General', 150, 48);

    if (delivery.trackingNumber) {
        doc.setFont('helvetica', 'bold');
        doc.text('TRACKING #:', 150, 30);
        doc.setFont('helvetica', 'normal');
        doc.text(delivery.trackingNumber, 150, 35);
    }

    const tableData = delivery.items.map((item, index) => [
        index + 1,
        (item.Product?.name || item.productName || 'Unknown') + (item.colorName ? ` - ${item.colorName}` : ''),
        item.quantity,
        item.Product?.uom || item.uom || 'pcs',
        item.notes || ''
    ]);

    autoTable(doc, {
        startY: 45,
        head: [['#', 'Description', 'Qty', 'UOM', 'Remarks']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 2,
            lineColor: [41, 128, 185],
            lineWidth: 0.3
        },
        bodyStyles: {
            fontSize: 10,
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            cellPadding: 2,
            lineColor: [41, 128, 185],
            lineWidth: 0.3
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 'auto' }
        },
        tableWidth: 190,
        margin: { left: 10, right: 10 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Signature:', 10, finalY);
    doc.line(10, finalY + 10, 60, finalY + 10);

    doc.text('Prepared By:', 150, finalY);
    doc.line(150, finalY + 10, 200, finalY + 10);

    if (delivery.notes) {
        doc.setFont('helvetica', 'normal');
        doc.text('NOTES:', 10, finalY + 15);
        doc.text(delivery.notes, 10, finalY + 19, { maxWidth: 180 });
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by Thaha Plastic Industries', 105, finalY + 30, { align: 'center' });

    // Auto print logic
    doc.autoPrint();
    const hiddFrame = document.createElement('iframe');
    hiddFrame.style.position = 'fixed';
    hiddFrame.style.width = '1px';
    hiddFrame.style.height = '1px';
    hiddFrame.style.top = '-1px';
    hiddFrame.style.left = '-1px';
    const blob = doc.output('blob');
    hiddFrame.src = URL.createObjectURL(blob);
    document.body.appendChild(hiddFrame);

    hiddFrame.onload = () => {
        if (hiddFrame.contentWindow) {
            hiddFrame.contentWindow.print();
            // Remove the iframe after a delay to ensure printing is initiated
            setTimeout(() => {
                document.body.removeChild(hiddFrame);
            }, 5000);
        }
    };

    doc.save(`DeliveryOrder_${delivery.deliveryNumber}.pdf`);
};

