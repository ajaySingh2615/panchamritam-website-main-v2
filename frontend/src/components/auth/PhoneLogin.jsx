import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [formError, setFormError] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  
  const { verifyPhoneOTP, loading } = useAuth();
  
  // Initialize reCAPTCHA verifier
  useEffect(() => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
      setRecaptchaVerifier(verifier);
    }
  }, [recaptchaVerifier]);
  
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!phoneNumber) {
      setFormError('Please enter a valid phone number');
      return;
    }
    
    try {
      // Format phone number for Firebase
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Send OTP using Firebase
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      
      // Store confirmation result for verification
      window.confirmationResult = confirmationResult;
      
      setOtpSent(true);
      setIsNewUser(true); // We'll determine this after verification
    } catch (error) {
      console.error('Error sending OTP:', error);
      setFormError(error.message || 'Failed to send verification code');
    }
  };
  
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!otp) {
      setFormError('Please enter the verification code');
      return;
    }
    
    if (isNewUser && !name) {
      setFormError('Please enter your name to complete registration');
      return;
    }
    
    try {
      // Verify OTP using Firebase
      const result = await window.confirmationResult.confirm(otp);
      
      // Get the user's phone number
      const phoneNumber = result.user.phoneNumber;
      
      // Get the ID token
      const idToken = await result.user.getIdToken();
      
      // Call our backend to create/update user
      await verifyPhoneOTP(idToken, isNewUser ? name : null);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setFormError(error.message || 'Failed to verify code');
    }
  };
  
  return (
    <div className="phone-login-container">
      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <PhoneInput
              id="phone"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={setPhoneNumber}
              defaultCountry="IN"
              disabled={loading}
              required
            />
          </div>
          
          {formError && <div className="error-message">{formError}</div>}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          {isNewUser && (
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="otp">Verification Code</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter verification code"
              disabled={loading}
              required
            />
          </div>
          
          {formError && <div className="error-message">{formError}</div>}
          
          <div className="otp-buttons">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            
            <button 
              type="button" 
              className="secondary-btn"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setFormError('');
              }}
              disabled={loading}
            >
              Change Phone Number
            </button>
          </div>
        </form>
      )}
      
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default PhoneLogin; 