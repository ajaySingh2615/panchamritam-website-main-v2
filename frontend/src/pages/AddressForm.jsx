import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import Breadcrumb from '../components/common/Breadcrumb';
import './Checkout.css'; // Reuse checkout styles

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
    <div className="checkout-page">
      <div className="checkout-container">
        <Breadcrumb items={breadcrumbItems} />

        <h1>Add New Address</h1>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="address-form">
          <div className="form-group">
            <label htmlFor="name">Full Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number*</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="houseNo">House No, Building*</label>
            <input
              type="text"
              id="houseNo"
              name="houseNo"
              value={formData.houseNo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="street">Street*</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">Area*</label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="locality">Locality/Town*</label>
            <input
              type="text"
              id="locality"
              name="locality"
              value={formData.locality}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City/District*</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State*</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="zipCode">Pin Code*</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country*</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Type of Address*</label>
            <div className="address-type-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === "Home"}
                  onChange={handleChange}
                  required
                />
                <span>Home</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="addressType"
                  value="Office"
                  checked={formData.addressType === "Office"}
                  onChange={handleChange}
                />
                <span>Office</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="addressType"
                  value="Other"
                  checked={formData.addressType === "Other"}
                  onChange={handleChange}
                />
                <span>Other</span>
              </label>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <span>Make this my default address</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => navigate('/checkout')}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm; 