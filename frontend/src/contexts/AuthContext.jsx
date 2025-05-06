import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AUTH_ENDPOINTS, createApiUrl } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const navigate = useNavigate();
  
  // For testing: Set a success message when the component mounts
  useEffect(() => {
    // Comment this out in production
    setSuccessMessage('Welcome to Green Magic Farming!');
    
    // Clean up after 5 seconds
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Check for OAuth callback
  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        navigate('/dashboard');
      } else if (error) {
        setError(error);
        navigate('/login');
      }
    };
    
    // Check if we're on the oauth-callback route
    if (window.location.pathname === '/oauth-callback') {
      handleOAuthCallback();
    }
  }, [navigate]);
  
  // Effect to check if user is already logged in
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(AUTH_ENDPOINTS.PROFILE, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          // If token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setError("Failed to authenticate. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in with Firebase
        try {
          // Get the user's phone number
          const phoneNumber = user.phoneNumber;
          
          // Call our backend to get/create user
          const response = await fetch(AUTH_ENDPOINTS.PHONE_VERIFY, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber })
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.data.user);
          }
        } catch (error) {
          console.error('Error syncing Firebase user:', error);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.data.user);
        setSuccessMessage(`Welcome back, ${data.data.user.name}! Login successful.`);
        navigate('/dashboard');
        return { success: true };
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
      return { success: false, message: "Login failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Auto login after registration
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.data.user);
        setSuccessMessage(`Welcome to Green Magic Farming, ${userData.name}! Your account has been created successfully.`);
        navigate('/dashboard');
        return { success: true };
      } else {
        setError(data.message || 'Registration failed. Please try again.');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
      return { success: false, message: "Registration failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };
  
  // Send phone OTP
  const sendPhoneOTP = async (phoneNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(createApiUrl('/auth/phone/send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, verificationId: data.verificationId };
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("OTP send error:", error);
      setError("Failed to send OTP. Please try again.");
      return { success: false, message: "Failed to send OTP. Please try again." };
    } finally {
      setLoading(false);
    }
  };
  
  // Verify phone OTP and login/register
  const verifyPhoneOTP = async (idToken, name = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = name 
        ? createApiUrl('/auth/phone/register') 
        : createApiUrl('/auth/phone/login');
      
      const requestBody = name 
        ? { idToken, name } 
        : { idToken };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.data.user);
        navigate('/dashboard');
        return { success: true };
      } else {
        setError(data.message || 'Verification failed. Please try again.');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Verification failed. Please try again.");
      return { success: false, message: "Verification failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };
  
  // Google login handler
  const handleGoogleLoginSuccess = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(createApiUrl('/auth/google/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Google login failed. Please try again.');
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Provide the auth context value
  const value = {
    user,
    token,
    loading,
    error,
    successMessage,
    isAuthenticated: !!user,
    setError,
    setSuccessMessage,
    login,
    register,
    logout,
    sendPhoneOTP,
    verifyPhoneOTP,
    handleGoogleLoginSuccess
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext; 