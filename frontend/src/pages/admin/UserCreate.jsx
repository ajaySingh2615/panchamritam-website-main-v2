import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser, getAllRoles } from '../../services/adminAPI';

const UserCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone_number: '',
    role_id: '',
  });
  const [validation, setValidation] = useState({
    name: { valid: true, message: '' },
    email: { valid: true, message: '' },
    password: { valid: true, message: '' },
    passwordConfirm: { valid: true, message: '' },
  });

  useEffect(() => {
    // Fetch roles for dropdown
    const fetchRoles = async () => {
      try {
        const data = await getAllRoles();
        setRoles(data.roles || []);
        
        // Default to user role if available
        const userRole = data.roles?.find(role => role.role_name === 'user');
        if (userRole) {
          setFormData(prev => ({
            ...prev,
            role_id: userRole.role_id
          }));
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to load role options. Please try again.');
      }
    };

    fetchRoles();
  }, []);

  const validateField = (name, value) => {
    let isValid = true;
    let message = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          isValid = false;
          message = 'Name is required';
        }
        break;
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          isValid = false;
          message = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          isValid = false;
          message = 'Password must be at least 6 characters';
        }
        break;
      case 'passwordConfirm':
        if (value !== formData.password) {
          isValid = false;
          message = 'Passwords do not match';
        }
        break;
      default:
        break;
    }

    setValidation(prev => ({
      ...prev,
      [name]: { valid: isValid, message }
    }));

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate on change
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    let isFormValid = true;
    for (const field of ['name', 'email', 'password', 'passwordConfirm']) {
      const isFieldValid = validateField(field, formData[field]);
      if (!isFieldValid) {
        isFormValid = false;
      }
    }
    
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await createUser(formData);
      setSuccess(true);
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        navigate(`/admin/users/${data.data.user.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/admin/users" className="text-green-600 hover:text-green-800 mr-4">
            ← Back to Users
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">Create New User</h1>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> User created successfully. Redirecting...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  !validation.name.valid ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {!validation.name.valid && (
                <p className="mt-1 text-sm text-red-600">{validation.name.message}</p>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  !validation.email.valid ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {!validation.email.valid && (
                <p className="mt-1 text-sm text-red-600">{validation.email.message}</p>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  !validation.password.valid ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {!validation.password.valid && (
                <p className="mt-1 text-sm text-red-600">{validation.password.message}</p>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  !validation.passwordConfirm.valid ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {!validation.passwordConfirm.valid && (
                <p className="mt-1 text-sm text-red-600">{validation.passwordConfirm.message}</p>
              )}
            </div>

            <div className="col-span-1">
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreate; 