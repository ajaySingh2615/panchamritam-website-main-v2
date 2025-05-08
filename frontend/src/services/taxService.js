import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

class TaxService {
  // Get tax info for a product
  static async getProductTaxInfo(productId) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.PRODUCTS}/${productId}/tax`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product tax info:', error);
      throw error;
    }
  }
  
  // Calculate product price with tax
  static async calculatePriceWithTax(productId, quantity = 1) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.PRODUCTS}/${productId}/price-with-tax?quantity=${quantity}`
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating price with tax:', error);
      throw error;
    }
  }
  
  // Admin: Get all GST rates
  static async getAllGSTRates(token) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.TAX}/gst`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching GST rates:', error);
      throw error;
    }
  }
  
  // Admin: Create GST rate
  static async createGSTRate(rateData, token) {
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.TAX}/gst`,
        rateData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating GST rate:', error);
      throw error;
    }
  }
  
  // Admin: Update GST rate
  static async updateGSTRate(rateId, rateData, token) {
    try {
      const response = await axios.patch(
        `${API_ENDPOINTS.TAX}/gst/${rateId}`,
        rateData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating GST rate:', error);
      throw error;
    }
  }
  
  // Admin: Delete GST rate
  static async deleteGSTRate(rateId, token) {
    try {
      const response = await axios.delete(
        `${API_ENDPOINTS.TAX}/gst/${rateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting GST rate:', error);
      throw error;
    }
  }
  
  // Admin: Get all HSN codes
  static async getAllHSNCodes(page = 1, limit = 100, token) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.TAX}/hsn?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching HSN codes:', error);
      // Return a structured empty response instead of throwing an error
      // This will prevent the component from crashing
      return {
        status: 'error',
        message: 'Could not load HSN codes. The database table might not exist yet.',
        data: {
          codes: [],
          pagination: {
            page: 1,
            limit,
            hasMore: false
          }
        }
      };
    }
  }
  
  // Admin: Search HSN codes
  static async searchHSNCodes(query, token) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.TAX}/hsn/search?query=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching HSN codes:', error);
      throw error;
    }
  }
  
  // Admin: Create HSN code
  static async createHSNCode(codeData, token) {
    try {
      // Log the data being sent to help debug
      console.log('Creating HSN code with data:', codeData);
      
      // Ensure all data is properly formatted
      const formattedData = {
        code: codeData.code.trim(),
        description: codeData.description ? codeData.description.trim() : null,
        default_gst_rate_id: codeData.default_gst_rate_id ? Number(codeData.default_gst_rate_id) : null
      };
      
      console.log('Formatted data:', formattedData);
      
      const response = await axios.post(
        `${API_ENDPOINTS.TAX}/hsn`,
        formattedData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating HSN code:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        throw {
          ...error,
          message: error.response.data.message || 'Failed to create HSN code'
        };
      }
      throw error;
    }
  }
  
  // Admin: Update HSN code
  static async updateHSNCode(codeId, codeData, token) {
    try {
      const response = await axios.patch(
        `${API_ENDPOINTS.TAX}/hsn/${codeId}`,
        codeData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating HSN code:', error);
      throw error;
    }
  }
  
  // Admin: Bulk import HSN codes
  static async bulkImportHSNCodes(codesData, token) {
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.TAX}/hsn/bulk-import`,
        { codes: codesData },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk importing HSN codes:', error);
      throw error;
    }
  }
  
  // Admin: Update product tax attributes
  static async updateProductTaxAttributes(productId, taxData, token) {
    try {
      const response = await axios.patch(
        `${API_ENDPOINTS.PRODUCTS}/${productId}/tax`,
        taxData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product tax attributes:', error);
      throw error;
    }
  }
  
  // Admin: Bulk update product tax attributes
  static async bulkUpdateProductTaxAttributes(productIds, taxAttributes, token) {
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.PRODUCTS}/bulk-update-tax`,
        {
          product_ids: productIds,
          tax_attributes: taxAttributes
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk updating product tax attributes:', error);
      throw error;
    }
  }
  
  // Get invoice for an order
  static async getOrderInvoice(orderId, token) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.ORDERS}/${orderId}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching order invoice:', error);
      throw error;
    }
  }
  
  // Generate invoice PDF for an order
  static async generateInvoicePDF(orderId, token) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.ORDERS}/${orderId}/invoice/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }
  
  // Download invoice PDF for an order
  static downloadInvoicePDF(pdfBlob, invoiceNumber) {
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
  
  // Email invoice to customer
  static async emailInvoice(orderId, email, token) {
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.ORDERS}/${orderId}/invoice/email`,
        { email },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error emailing invoice:', error);
      throw error;
    }
  }
  
  // Get tax summary for a specified date range
  static async getTaxSummary(startDate, endDate, token) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.TAX}/summary?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tax summary:', error);
      throw error;
    }
  }
}

export default TaxService; 