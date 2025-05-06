import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function MainLayout() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  
  // Close the mobile nav when the window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isNavOpen) {
        setIsNavOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNavOpen]);
  
  // Close the navigation when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const nav = document.querySelector('.main-nav');
      const toggle = document.querySelector('.mobile-nav-toggle');
      
      if (isNavOpen && nav && !nav.contains(event.target) && !toggle.contains(event.target)) {
        setIsNavOpen(false);
      }
    };
    
    if (isNavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isNavOpen]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLogout = () => {
    logout();
    setIsNavOpen(false);
  };

  return (
    <div className="layout-container">
      <div className={`nav-overlay ${isNavOpen ? 'active' : ''}`} onClick={() => setIsNavOpen(false)}></div>
      
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>Green Magic Farming</h1>
            </Link>
          </div>

          <button 
            className="mobile-nav-toggle" 
            onClick={toggleNav}
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
          >
            <div className={`hamburger ${isNavOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <nav className={`main-nav ${isNavOpen ? 'nav-open' : ''}`}>
            <ul>
              <li><Link to="/" onClick={() => setIsNavOpen(false)}>Home</Link></li>
              <li><Link to="/about" onClick={() => setIsNavOpen(false)}>About</Link></li>
              <li><Link to="/services" onClick={() => setIsNavOpen(false)}>Products</Link></li>
              <li><Link to="/contact" onClick={() => setIsNavOpen(false)}>Contact</Link></li>
              
              {isAuthenticated ? (
                <>
                  <li><Link to="/dashboard" onClick={() => setIsNavOpen(false)}>Dashboard</Link></li>
                  <li><button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" onClick={() => setIsNavOpen(false)}>Login</Link></li>
                  <li><Link to="/register" onClick={() => setIsNavOpen(false)}>Register</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Green Magic Farming. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MainLayout; 