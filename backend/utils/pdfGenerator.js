const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF invoice for an order
 * @param {Object} invoiceData - The invoice data
 * @param {Stream} outputStream - The output stream to write the PDF to
 */
const generateInvoicePDF = (invoiceData, outputStream) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document with increased margins
      const doc = new PDFDocument({ 
        margin: 60,
        size: 'A4'
      });
      
      // Define page dimensions for easier reference
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const contentWidth = pageWidth - 120; // Account for left and right margins
      
      // Pipe the PDF to the output stream
      doc.pipe(outputStream);
      
      // Add company logo (if available)
      const logoPath = path.join(__dirname, '../public/images/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 60, 60, { width: 120 })
           .moveDown();
      }
      
      // Company info block (top left, each line separate)
      let y = 60;
      doc.fontSize(18).font('Helvetica-Bold').fillColor('black')
         .text('Panchamritam Ayurvedic Foods', 60, y, { align: 'left' });
      y += 22;
      doc.fontSize(10).font('Helvetica').fillColor('black')
         .text('123 Ayurveda Street', 60, y, { align: 'left' });
      y += 14;
      doc.text('Bangalore, Karnataka 560001', 60, y, { align: 'left' });
      y += 14;
      doc.text('India', 60, y, { align: 'left' });
      y += 14;
      doc.text('Email: info@panchamritam.com', 60, y, { align: 'left' });
      y += 14;
      doc.text('GSTIN: 29AABCP1234A1Z5', 60, y, { align: 'left' });
      y += 24;
      // Horizontal line before TAX INVOICE
      doc.moveTo(60, y).lineTo(pageWidth - 60, y).strokeColor('#eee').stroke();
      y += 12;
      // TAX INVOICE header
      doc.fontSize(22).font('Helvetica-Bold').fillColor('black')
         .text('TAX INVOICE', 0, y, { align: 'center', width: pageWidth });
      y += 30;
      doc.moveTo(60, y).lineTo(pageWidth - 60, y).strokeColor('#eee').stroke();
      y += 18;
      // Three-column layout for Invoice Details, Bill To, Ship To
      // Adjusted for more space between Bill To and Ship To
      const colGap = 30; // Increased gap between columns
      const colWidth = (contentWidth - 2 * colGap) / 3;
      const leftX = 60;
      const midX = leftX + colWidth + colGap;
      const rightX = midX + colWidth + colGap;
      const detailsY = y;
      // Invoice Details (left column)
      doc.fontSize(10).font('Helvetica').fillColor('black');
      let detailsLineY = detailsY;
      doc.text(`Invoice Number: ${invoiceData.invoice.invoice_number}`, leftX, detailsLineY, { width: colWidth });
      detailsLineY += 15;
      doc.text(`Order Number: #${invoiceData.invoice.order_id}`, leftX, detailsLineY, { width: colWidth });
      detailsLineY += 15;
      doc.text(`Invoice Date: ${new Date(invoiceData.invoice.invoice_date).toLocaleDateString()}`, leftX, detailsLineY, { width: colWidth });
      detailsLineY += 15;
      doc.text(`Order Date: ${new Date(invoiceData.invoice.order_date).toLocaleDateString()}`, leftX, detailsLineY, { width: colWidth });
      detailsLineY += 15;
      doc.text(`Status: ${invoiceData.invoice.status.toUpperCase()}`, leftX, detailsLineY, { width: colWidth });
      // Bill To (middle column)
      let billToY = detailsY;
      doc.font('Helvetica-Bold').text('Bill To:', midX, billToY, { width: colWidth });
      billToY += 15;
      doc.font('Helvetica').text(`${invoiceData.customer.name || 'N/A'}`, midX, billToY, { width: colWidth });
      billToY += 15;
      doc.text(`Email: ${invoiceData.customer.email || 'N/A'}`, midX, billToY, { width: colWidth });
      // Ship To (right column)
      let shipToY = detailsY;
      if (invoiceData.shipping_address) {
        doc.font('Helvetica-Bold').text('Ship To:', rightX, shipToY, { width: colWidth });
        shipToY += 15;
        doc.font('Helvetica').text(`${invoiceData.shipping_address.name || ''}`, rightX, shipToY, { width: colWidth });
        shipToY += 15;
        // Address line with wrapping
        doc.text(`${invoiceData.shipping_address.address_line || ''}`, rightX, shipToY, { width: colWidth });
        // Add extra space after address line to prevent collision
        shipToY += 28;
        doc.text(`${invoiceData.shipping_address.address_line2 ? invoiceData.shipping_address.address_line2 + ', ' : ''}${invoiceData.shipping_address.city || ''}`, rightX, shipToY, { width: colWidth });
        shipToY += 15;
        doc.text(`${invoiceData.shipping_address.state || ''}, ${invoiceData.shipping_address.postal_code || invoiceData.shipping_address.zip_code || ''}`, rightX, shipToY, { width: colWidth });
        shipToY += 15;
        doc.text(`${invoiceData.shipping_address.country || ''}`, rightX, shipToY, { width: colWidth });
        shipToY += 15;
        doc.text(`Phone: ${invoiceData.shipping_address.phone_number || 'N/A'}`, rightX, shipToY, { width: colWidth });
      }
      // Optional: Draw a subtle vertical separator between columns
      doc.save().moveTo(midX - colGap / 2, detailsY).lineTo(midX - colGap / 2, Math.max(detailsLineY, billToY, shipToY || detailsY)).strokeColor('#e0e0e0').lineWidth(1).stroke().restore();
      doc.save().moveTo(rightX - colGap / 2, detailsY).lineTo(rightX - colGap / 2, Math.max(detailsLineY, billToY, shipToY || detailsY)).strokeColor('#e0e0e0').lineWidth(1).stroke().restore();
      // Find the max Y for the next section
      y = Math.max(detailsLineY, billToY, shipToY || detailsY) + 20;
      doc.moveTo(60, y).lineTo(pageWidth - 60, y).strokeColor('#eee').stroke();
      y += 12;
      // Table header
      const tableLeft = 60;
      const tableRight = pageWidth - 60;
      const tableWidth = tableRight - tableLeft;
      const colWidths = {
        item: 0.22 * tableWidth,
        hsn: 0.09 * tableWidth,
        qty: 0.07 * tableWidth,
        price: 0.12 * tableWidth,
        subtotal: 0.13 * tableWidth,
        gst: 0.09 * tableWidth,
        tax: 0.13 * tableWidth,
        total: 0.15 * tableWidth
      };
      let colX = tableLeft;
      doc.font('Helvetica-Bold').fontSize(11);
      doc.text('Item', colX, y, { width: colWidths.item }); colX += colWidths.item;
      doc.text('HSN', colX, y, { width: colWidths.hsn, align: 'center' }); colX += colWidths.hsn;
      doc.text('Qty', colX, y, { width: colWidths.qty, align: 'center' }); colX += colWidths.qty;
      doc.text('Price', colX, y, { width: colWidths.price, align: 'right' }); colX += colWidths.price;
      doc.text('Subtotal', colX, y, { width: colWidths.subtotal, align: 'right' }); colX += colWidths.subtotal;
      doc.text('GST %', colX, y, { width: colWidths.gst, align: 'center' }); colX += colWidths.gst;
      doc.text('Tax', colX, y, { width: colWidths.tax, align: 'right' }); colX += colWidths.tax;
      doc.text('Total', colX, y, { width: colWidths.total, align: 'right' });
      y += 18;
      doc.moveTo(tableLeft, y).lineTo(tableRight, y).strokeColor('black').stroke();
      y += 5;
      // Table rows
      doc.font('Helvetica').fontSize(10);
      invoiceData.items.forEach((item) => {
        let colX = tableLeft;
        doc.text(item.name, colX, y, { width: colWidths.item }); colX += colWidths.item;
        doc.text(item.hsn_code || 'N/A', colX, y, { width: colWidths.hsn, align: 'center' }); colX += colWidths.hsn;
        doc.text(item.quantity, colX, y, { width: colWidths.qty, align: 'center' }); colX += colWidths.qty;
        doc.text('₹' + item.price.toFixed(2), colX, y, { width: colWidths.price, align: 'right' }); colX += colWidths.price;
        doc.text('₹' + item.subtotal.toFixed(2), colX, y, { width: colWidths.subtotal, align: 'right' }); colX += colWidths.subtotal;
        doc.text(item.tax_rate + '%', colX, y, { width: colWidths.gst, align: 'center' }); colX += colWidths.gst;
        doc.text('₹' + item.tax_amount.toFixed(2), colX, y, { width: colWidths.tax, align: 'right' }); colX += colWidths.tax;
        doc.text('₹' + item.total.toFixed(2), colX, y, { width: colWidths.total, align: 'right' });
        y += 16;
      });
      y += 8;
      doc.moveTo(tableLeft, y).lineTo(tableRight, y).strokeColor('black').stroke();
      y += 14;
      // Totals
      const summaryX = tableRight - 200;
      doc.font('Helvetica').fontSize(11);
      doc.text('Subtotal:', summaryX, y, { width: 100, align: 'right' });
      doc.text('₹' + invoiceData.summary.subtotal.toFixed(2), summaryX + 110, y, { width: 90, align: 'right' });
      y += 16;
      invoiceData.summary.tax_breakdown.forEach((tax) => {
        doc.text(`GST (${tax.rate}%):`, summaryX, y, { width: 100, align: 'right' });
        doc.text('₹' + tax.tax_amount.toFixed(2), summaryX + 110, y, { width: 90, align: 'right' });
        y += 14;
      });
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('TOTAL:', summaryX, y, { width: 100, align: 'right' });
      doc.text('₹' + invoiceData.summary.total.toFixed(2), summaryX + 110, y, { width: 90, align: 'right' });
      y += 24;
      // Payment Method and Status (separate lines, clear labels)
      doc.font('Helvetica').fontSize(11);
      doc.text('Payment Method:', summaryX, y, { width: 100, align: 'right' });
      doc.font('Helvetica-Bold').text(invoiceData.payment.method, summaryX + 110, y, { width: 90, align: 'right' });
      y += 16;
      doc.font('Helvetica').text('Payment Status:', summaryX, y, { width: 100, align: 'right' });
      doc.font('Helvetica-Bold').text(invoiceData.payment.status.toUpperCase(), summaryX + 110, y, { width: 90, align: 'right' });
      y += 30;
      // Footer
      doc.fontSize(8).fillColor('gray');
      doc.text('This is a computer-generated invoice and does not require a physical signature.', 60, pageHeight - 60, { align: 'center', width: contentWidth });
      doc.text('Thank you for shopping with Panchamritam Ayurvedic Foods!', 60, pageHeight - 45, { align: 'center', width: contentWidth });
      
      // Finalize PDF
      doc.end();
      
      // Resolve the promise when the PDF is finished
      outputStream.on('finish', () => {
        resolve();
      });
      
      // Reject the promise if there's an error
      outputStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF
}; 