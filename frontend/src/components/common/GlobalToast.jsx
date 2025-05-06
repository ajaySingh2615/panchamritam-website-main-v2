import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const GlobalToast = () => {
  const { successMessage, error, clearSuccessMessage, clearError } = useAuth();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');

  useEffect(() => {
    if (successMessage) {
      setMessage(successMessage);
      setType('success');
      setVisible(true);
    } else if (error) {
      setMessage(error);
      setType('error');
      setVisible(true);
    }
  }, [successMessage, error]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        
        setTimeout(() => {
          if (type === 'success' && clearSuccessMessage) {
            clearSuccessMessage();
          } else if (type === 'error' && clearError) {
            clearError();
          }
        }, 300);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, type, clearSuccessMessage, clearError]);

  const handleClose = () => {
    setVisible(false);
    
    setTimeout(() => {
      if (type === 'success' && clearSuccessMessage) {
        clearSuccessMessage();
      } else if (type === 'error' && clearError) {
        clearError();
      }
    }, 300);
  };

  if (!visible || (!successMessage && !error)) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        <div className="toast-content">
          {type === 'success' && <span className="toast-icon">✅</span>}
          {type === 'error' && <span className="toast-icon">⚠️</span>}
          {message}
        </div>
        <button className="toast-close" onClick={handleClose}>&times;</button>
      </div>
    </div>
  );
};

export default GlobalToast; 