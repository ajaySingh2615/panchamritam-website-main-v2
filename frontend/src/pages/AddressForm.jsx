import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import Breadcrumb from '../components/common/Breadcrumb';

const AddressForm = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    houseNo: '',
    street: '',
    area: '',
    locality: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    addressType: 'Home',
    isDefault: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Combine address components into a single address line
    const addressLine = `${formData.houseNo}, ${formData.street}, ${formData.area}, ${formData.locality}`;

    try {
      const response = await fetch(createApiUrl('/addresses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          addressLine,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phoneNumber: formData.phoneNumber,
          addressType: formData.addressType,
          isDefault: formData.isDefault
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add address');
      }

      setSuccess(true);
      // Redirect back to checkout after a short delay
      setTimeout(() => {
        navigate('/checkout');
      }, 1500);
    } catch (err) {
      console.error('Error adding address:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Checkout', path: '/checkout' },
    { label: 'Add Address', path: '/address/add' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Saving your address...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="success-container">
        <h2>Address Added Successfully!</h2>
        <p>Redirecting back to checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-2 pt-20 md:pt-24" style={{ backgroundColor: '#f8f6f3' }}>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">Add New Address</h1>
        {error && (
          <div className="mb-4 flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <span>Address Added Successfully! Redirecting back to checkout...</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block font-semibold text-gray-700 mb-1">Full Name*</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block font-semibold text-gray-700 mb-1">Phone Number*</label>
              <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="houseNo" className="block font-semibold text-gray-700 mb-1">House No, Building*</label>
              <input type="text" id="houseNo" name="houseNo" value={formData.houseNo} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="street" className="block font-semibold text-gray-700 mb-1">Street*</label>
              <input type="text" id="street" name="street" value={formData.street} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="area" className="block font-semibold text-gray-700 mb-1">Area*</label>
              <input type="text" id="area" name="area" value={formData.area} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="locality" className="block font-semibold text-gray-700 mb-1">Locality/Town*</label>
              <input type="text" id="locality" name="locality" value={formData.locality} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="city" className="block font-semibold text-gray-700 mb-1">City/District*</label>
              <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="state" className="block font-semibold text-gray-700 mb-1">State*</label>
              <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="zipCode" className="block font-semibold text-gray-700 mb-1">Pin Code*</label>
              <input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="country" className="block font-semibold text-gray-700 mb-1">Country*</label>
              <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Type of Address*</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="addressType" value="Home" checked={formData.addressType === 'Home'} onChange={handleChange} required className="w-5 h-5 text-green-600 focus:ring-green-500" />
                  <span>Home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="addressType" value="Office" checked={formData.addressType === 'Office'} onChange={handleChange} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                  <span>Office</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="addressType" value="Other" checked={formData.addressType === 'Other'} onChange={handleChange} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                  <span>Other</span>
                </label>
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                <span>Make this my default address</span>
              </label>
            </div>
          </div>
          <div className="flex justify-between gap-4 mt-8">
            <button type="button" className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition" onClick={() => navigate('/checkout')}>Cancel</button>
            <button type="submit" className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">Save Address</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm; 