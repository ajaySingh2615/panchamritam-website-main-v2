import React from 'react';

function GoogleLogin() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <button 
      type="button" 
      className="social-login-btn google-btn"
      onClick={handleGoogleLogin}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        <path d="M8 12h8"/>
        <path d="M12 8v8"/>
      </svg>
      Continue with Google
    </button>
  );
}

export default GoogleLogin; 