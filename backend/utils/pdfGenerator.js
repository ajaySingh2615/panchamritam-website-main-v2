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
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Pipe the PDF to the output stream
      doc.pipe(outputStream);
      
      // Add company logo (if available)
      const logoPath = path.join(__dirname, '../public/images/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 150 })
           .moveDown();
      }
      
      // Add company information
      doc.fontSize(20)
         .text('Panchamritam Ayurvedic Foods', 50, 50, { align: 'right' })
         .fontSize(10)
         .text('123 Ayurveda Street', { align: 'right' })
         .text('Bangalore, Karnataka 560001', { align: 'right' })
         .text('India', { align: 'right' })
         .text('Email: info@panchamritam.com', { align: 'right' })
         .text('GSTIN: 29AABCP1234A1Z5', { align: 'right' })
         .moveDown();
      
      // Add invoice header
      doc.fontSize(16)
         .text('TAX INVOICE', { align: 'center' })
         .moveDown();
      
      // Add invoice details table
      doc.fontSize(10)
         .text(`Invoice Number: ${invoiceData.invoice.invoice_number}`, 50, 180)
         .text(`Order Number: #${invoiceData.invoice.order_id}`, 50, 195)
         .text(`Invoice Date: ${new Date(invoiceData.invoice.invoice_date).toLocaleDateString()}`, 50, 210)
         .text(`Order Date: ${new Date(invoiceData.invoice.order_date).toLocaleDateString()}`, 50, 225)
         .text(`Status: ${invoiceData.invoice.status.toUpperCase()}`, 50, 240);
      
      // Add customer details
      doc.text('Bill To:', 300, 180)
         .text(`${invoiceData.customer.name || 'N/A'}`, 300, 195)
         .text(`Email: ${invoiceData.customer.email || 'N/A'}`, 300, 210)
         .text(`Phone: ${invoiceData.customer.phone || 'N/A'}`, 300, 225);
      
      // Add shipping address if available
      if (invoiceData.shipping_address) {
        doc.text('Ship To:', 450, 180)
           .text(`${invoiceData.shipping_address.name || ''}`, 450, 195)
           .text(`${invoiceData.shipping_address.address_line1 || ''}`, 450, 210)
           .text(`${invoiceData.shipping_address.address_line2 ? invoiceData.shipping_address.address_line2 + ', ' : ''}${invoiceData.shipping_address.city || ''}`, 450, 225)
           .text(`${invoiceData.shipping_address.state || ''}, ${invoiceData.shipping_address.postal_code || ''}`, 450, 240)
           .text(`${invoiceData.shipping_address.country || ''}`, 450, 255);
      }
      
      // Add item table headers
      doc.moveDown(4);
      const tableTop = 280;
      doc.font('Helvetica-Bold')
         .text('Item', 50, tableTop)
         .text('HSN', 220, tableTop, { width: 60, align: 'center' })
         .text('Qty', 280, tableTop, { width: 30, align: 'center' })
         .text('Price', 320, tableTop, { width: 60, align: 'right' })
         .text('Subtotal', 380, tableTop, { width: 70, align: 'right' })
         .text('GST %', 450, tableTop, { width: 50, align: 'center' })
         .text('Tax', 500, tableTop, { width: 60, align: 'right' })
         .text('Total', 560, tableTop, { width: 60, align: 'right' });
      
      // Add horizontal line
      doc.moveTo(50, tableTop + 15)
         .lineTo(610, tableTop + 15)
         .stroke();
      
      // Add item rows
      doc.font('Helvetica');
      let position = tableTop + 30;
      
      // Iterate through items
      invoiceData.items.forEach((item) => {
        // Check if we need a new page
        if (position > 700) {
          doc.addPage();
          // Reset position and add headers on new page
          position = 50;
          doc.font('Helvetica-Bold')
             .text('Item', 50, position)
             .text('HSN', 220, position, { width: 60, align: 'center' })
             .text('Qty', 280, position, { width: 30, align: 'center' })
             .text('Price', 320, position, { width: 60, align: 'right' })
             .text('Subtotal', 380, position, { width: 70, align: 'right' })
             .text('GST %', 450, position, { width: 50, align: 'center' })
             .text('Tax', 500, position, { width: 60, align: 'right' })
             .text('Total', 560, position, { width: 60, align: 'right' });
          
          // Add horizontal line
          doc.moveTo(50, position + 15)
             .lineTo(610, position + 15)
             .stroke();
             
          doc.font('Helvetica');
          position = position + 30;
        }
        
        // Format currency values
        const price = '₹' + item.price.toFixed(2);
        const subtotal = '₹' + item.subtotal.toFixed(2);
        const taxAmount = '₹' + item.tax_amount.toFixed(2);
        const total = '₹' + item.total.toFixed(2);
        
        // Add item details
        doc.text(item.name, 50, position, { width: 170 })
           .text(item.hsn_code || 'N/A', 220, position, { width: 60, align: 'center' })
           .text(item.quantity, 280, position, { width: 30, align: 'center' })
           .text(price, 320, position, { width: 60, align: 'right' })
           .text(subtotal, 380, position, { width: 70, align: 'right' })
           .text(item.tax_rate + '%', 450, position, { width: 50, align: 'center' })
           .text(taxAmount, 500, position, { width: 60, align: 'right' })
           .text(total, 560, position, { width: 60, align: 'right' });
        
        position += 20;
      });
      
      // Add horizontal line after items
      doc.moveTo(50, position)
         .lineTo(610, position)
         .stroke();
      
      // Add totals
      position += 20;
      doc.font('Helvetica')
         .text('Subtotal:', 400, position, { width: 100, align: 'right' })
         .text('₹' + invoiceData.summary.subtotal.toFixed(2), 520, position, { width: 100, align: 'right' });
      
      position += 20;
      
      // Add tax breakdown
      invoiceData.summary.tax_breakdown.forEach((tax) => {
        doc.text(`GST (${tax.rate}%):`, 400, position, { width: 100, align: 'right' })
           .text('₹' + tax.tax_amount.toFixed(2), 520, position, { width: 100, align: 'right' });
        position += 15;
      });
      
      // Add total
      position += 10;
      doc.font('Helvetica-Bold')
         .text('TOTAL:', 400, position, { width: 100, align: 'right' })
         .text('₹' + invoiceData.summary.total.toFixed(2), 520, position, { width: 100, align: 'right' });
      
      // Add payment information
      position += 30;
      doc.font('Helvetica')
         .text('Payment Method:', 400, position, { width: 100, align: 'right' })
         .text(invoiceData.payment.method, 520, position, { width: 100, align: 'right' });
      
      position += 15;
      doc.text('Payment Status:', 400, position, { width: 100, align: 'right' })
         .text(invoiceData.payment.status.toUpperCase(), 520, position, { width: 100, align: 'right' });
      
      // Add footer
      doc.fontSize(8)
         .text('This is a computer-generated invoice and does not require a physical signature.', 50, 700, { align: 'center' })
         .text('Thank you for shopping with Panchamritam Ayurvedic Foods!', 50, 715, { align: 'center' });
      
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