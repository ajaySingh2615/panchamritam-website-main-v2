import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function OAuthCallback() {
  const { handleGoogleLoginSuccess, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      
      if (token) {
        try {
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          // Verify token with backend
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // Set user data in context
            const success = await handleGoogleLoginSuccess(token);
            if (success) {
              // Use setTimeout to ensure state is updated before navigation
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 100);
            } else {
              setError('Authentication failed');
              navigate('/login', { replace: true });
            }
          } else {
            setError('Authentication failed');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Error processing callback:', error);
          setError('Authentication failed');
          navigate('/login', { replace: true });
        }
      } else if (error) {
        setError(error);
        navigate('/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };
    
    processCallback();
  }, [navigate, handleGoogleLoginSuccess, setError]);

  return (
    <div className="oauth-callback">
      <div className="loading-spinner"></div>
      <p>Processing your login, please wait...</p>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default OAuthCallback; 