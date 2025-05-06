import { useState, useEffect } from 'react';

const Toast = ({ type = 'success', message, onClose, autoClose = true, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300); // Call onClose after the animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose, visible]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300); // Call onClose after the animation
  };

  if (!visible) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={handleClose}>&times;</button>
    </div>
  );
};

export default Toast; 