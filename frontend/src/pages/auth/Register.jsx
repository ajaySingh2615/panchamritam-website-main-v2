import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLogin from '../../components/auth/GoogleLogin';
import PhoneLogin from '../../components/auth/PhoneLogin';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: ''
  });
  const [formError, setFormError] = useState('');
  const [registerMethod, setRegisterMethod] = useState('email'); // 'email' or 'phone'
  const { register, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    // Check minimum length
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    // Check for number
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    
    return null; // Password is valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, passwordConfirm } = formData;
    
    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirm.trim()) {
      setFormError('Please fill in all fields');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    // Password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }
    
    // Password confirmation validation
    if (password !== passwordConfirm) {
      setFormError('Passwords do not match');
      return;
    }
    
    // Clear form errors
    setFormError('');
    
    // Call register from AuthContext
    const result = await register(formData);
    
    if (!result.success) {
      // The error is already set in the AuthContext
      // You can add additional error handling here if needed
    }
  };

  // Function to show password strength requirements
  const renderPasswordRequirements = () => {
    return (
      <div className="password-requirements">
        <p>Password must:</p>
        <ul>
          <li className={formData.password.length >= 8 ? 'met' : ''}>
            Be at least 8 characters long
          </li>
          <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
            Include at least one uppercase letter
          </li>
          <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
            Include at least one lowercase letter
          </li>
          <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>
            Include at least one number
          </li>
          <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'met' : ''}>
            Include at least one special character
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join Green Magic Farming for fresh, organic products</p>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${registerMethod === 'email' ? 'active' : ''}`}
            onClick={() => setRegisterMethod('email')}
          >
            Email
          </button>
          <button 
            className={`auth-tab ${registerMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setRegisterMethod('phone')}
          >
            Phone
          </button>
        </div>
        
        {/* Show form validation error */}
        {formError && <div className="error-message">{formError}</div>}
        
        {registerMethod === 'email' ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
                <i className="input-icon">👤</i>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
                <i className="input-icon">📧</i>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number (Optional)</label>
              <div className="input-with-icon">
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
                <i className="input-icon">📱</i>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
                <i className="input-icon">🔒</i>
              </div>
              <small className="password-hint">
                Password must be at least 8 characters and include an uppercase letter, lowercase letter, and a number.
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="passwordConfirm">Confirm Password</label>
              <div className="input-with-icon">
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  required
                />
                <i className="input-icon">🔒</i>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <PhoneLogin />
        )}
        
        <div className="auth-separator">
          <span>OR</span>
        </div>
        
        <div className="social-login">
          <GoogleLogin />
        </div>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
        
        <div className="auth-decoration">
          <div className="leaf-decoration"></div>
        </div>
      </div>
    </div>
  );
}

export default Register; 