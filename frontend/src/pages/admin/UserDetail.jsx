import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getUser, 
  getUserOrders, 
  getUserAddresses, 
  getUserActivity,
  updateUserRole,
  resetUserPassword,
  updateUserStatus,
  deleteUser
} from '../../services/adminAPI';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const userData = await getUser(userId);
        setUser(userData.user);
        
        // Fetch related data based on active tab
        if (activeTab === 'orders') {
          await fetchUserOrders(userId);
        } else if (activeTab === 'addresses') {
          await fetchUserAddresses(userId);
        } else if (activeTab === 'activity') {
          await fetchUserActivity(userId);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, activeTab]);

  const fetchUserOrders = async (id) => {
    try {
      const data = await getUserOrders(id);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    }
  };

  const fetchUserAddresses = async (id) => {
    try {
      const data = await getUserAddresses(id);
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error('Error fetching user addresses:', err);
    }
  };

  const fetchUserActivity = async (id) => {
    try {
      const data = await getUserActivity(id);
      setActivityLog(data.activities || []);
    } catch (err) {
      console.error('Error fetching user activity:', err);
    }
  };

  const handleChangeRole = async (newRole) => {
    if (!confirm(`Are you sure you want to change ${user.name}'s role to ${newRole}?`)) {
      return;
    }
    
    try {
      const data = await updateUserRole(userId, newRole);
      setUser(prev => ({ ...prev, role_name: data.user.role_name }));
      alert('User role updated successfully');
    } catch (err) {
      console.error('Error updating user role:', err);
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`Are you sure you want to reset ${user.name}'s password?`)) {
      return;
    }
    
    try {
      await resetUserPassword(userId);
      alert('Password reset email has been sent to the user');
    } catch (err) {
      console.error('Error resetting password:', err);
      alert(`Failed to reset password: ${err.message}`);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!confirm(`Are you sure you want to deactivate ${user.name}'s account? This will prevent them from logging in.`)) {
      return;
    }
    
    try {
      const data = await updateUserStatus(userId, 'inactive');
      setUser(prev => ({ ...prev, status: data.user.status }));
      alert('User account deactivated successfully');
    } catch (err) {
      console.error('Error deactivating account:', err);
      alert(`Failed to deactivate account: ${err.message}`);
    }
  };

  const handleActivateAccount = async () => {
    if (!confirm(`Are you sure you want to activate ${user.name}'s account?`)) {
      return;
    }
    
    try {
      const data = await updateUserStatus(userId, 'active');
      setUser(prev => ({ ...prev, status: data.user.status }));
      alert('User account activated successfully');
    } catch (err) {
      console.error('Error activating account:', err);
      alert(`Failed to activate account: ${err.message}`);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${user.name}'s account? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteUser(userId);
      alert('User deleted successfully');
      navigate('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
        <p className="mt-2 text-gray-500">The user you are looking for might have been removed.</p>
        <Link to="/admin/users" className="mt-4 inline-block text-green-600 hover:text-green-800">
          ← Back to Users List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/admin/users" className="text-green-600 hover:text-green-800 mr-4">
            ← Back to Users
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">User Details</h1>
        </div>
        <div>
          <Link 
            to={`/admin/users/${userId}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ml-2"
          >
            Edit User
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* User Info Section */}
          <div className="md:col-span-1 border-r p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                {user.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-green-600 flex items-center justify-center text-4xl text-white">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.role_name === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role_name}
              </span>
              {user.status === 'inactive' && (
                <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Inactive
                </span>
              )}
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-500">User ID:</span>
                  <span className="font-medium">{user.user_id}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{user.email || 'N/A'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{user.phone_number || 'N/A'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                </p>
                {user.google_id && (
                  <p className="flex justify-between">
                    <span className="text-gray-500">Sign-in:</span>
                    <span className="font-medium">Google</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">User Actions</h3>
              <div className="space-y-2">
                {user.role_name === 'user' ? (
                  <button 
                    onClick={() => handleChangeRole('admin')}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                  >
                    Make Admin
                  </button>
                ) : (
                  <button 
                    onClick={() => handleChangeRole('user')}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                  >
                    Remove Admin Role
                  </button>
                )}
                <button 
                  onClick={handleResetPassword}
                  className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                >
                  Reset Password
                </button>
                {user.status !== 'inactive' ? (
                  <button 
                    onClick={handleDeactivateAccount}
                    className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md"
                  >
                    Deactivate Account
                  </button>
                ) : (
                  <button 
                    onClick={handleActivateAccount}
                    className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md"
                  >
                    Activate Account
                  </button>
                )}
                <button 
                  onClick={handleDeleteUser}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-red-600 hover:text-red-700 rounded-md mt-4"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>

          {/* User Detail Tabs */}
          <div className="md:col-span-3 p-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('orders')}
                >
                  Orders
                </button>
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'addresses'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('addresses')}
                >
                  Addresses
                </button>
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'activity'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity Log
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Order History</h3>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.order_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{order.order_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : order.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${order.total_amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/admin/orders/${order.order_id}`} className="text-green-600 hover:text-green-900">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No orders found for this user.</p>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Addresses</h3>
                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.address_id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{address.address_type || 'Address'}</p>
                              {address.is_default && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2">
                            <p>{address.street_address}</p>
                            <p>{address.city}, {address.state} {address.postal_code}</p>
                            <p>{address.country}</p>
                            {address.phone && <p className="mt-1">Phone: {address.phone}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No addresses found for this user.</p>
                  )}
                </div>
              )}

              {/* Activity Log Tab */}
              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  {activityLog.length > 0 ? (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {activityLog.map((activity, index) => (
                          <li key={activity.id}>
                            <div className="relative pb-8">
                              {index !== activityLog.length - 1 ? (
                                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"></span>
                              ) : null}
                              <div className="relative flex items-start space-x-3">
                                <div className="relative">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    activity.type === 'login' 
                                      ? 'bg-blue-500' 
                                      : activity.type === 'order' 
                                      ? 'bg-green-500'
                                      : 'bg-gray-500'
                                  }`}>
                                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      {activity.type === 'login' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                      ) : activity.type === 'order' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      )}
                                    </svg>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {activity.description}
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  {activity.details && (
                                    <div className="mt-2 text-sm text-gray-700">
                                      <p>{activity.details}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500">No activity recorded for this user.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail; 