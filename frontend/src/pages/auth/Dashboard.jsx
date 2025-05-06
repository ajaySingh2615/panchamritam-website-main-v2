import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function Dashboard() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h2>User Dashboard</h2>
        
        <div className="user-info">
          <div className="user-card">
            <h3>Welcome, {user.name}!</h3>
            <div className="user-details">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>User ID:</strong> {user.id}</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-actions">
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
        
        <div className="dashboard-sections">
          <section className="dashboard-section">
            <h3>Recent Activity</h3>
            <p>No recent activity to display.</p>
          </section>
          
          <section className="dashboard-section">
            <h3>Your Orders</h3>
            <p>You haven't placed any orders yet.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 