import { useState, useEffect } from 'react';
import Toast from './Toast';

const ToastContainer = ({ messages = [] }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (messages.length > 0 && messages !== toasts) {
      setToasts(messages);
    }
  }, [messages, toasts]);

  const removeToast = (id) => {
    setToasts(toasts.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type || 'success'}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer; 