import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/auth/Dashboard';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import About from './pages/About';
import Orders from './pages/Orders';
import AddressForm from './pages/AddressForm';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UsersList from './pages/admin/UsersList';
import UserDetail from './pages/admin/UserDetail';
import UserEdit from './pages/admin/UserEdit';
import UserCreate from './pages/admin/UserCreate';
import CategoriesList from './pages/admin/CategoriesList';
import CategoryCreate from './pages/admin/CategoryCreate';
import CategoryEdit from './pages/admin/CategoryEdit';
import ProductsList from './pages/admin/ProductsList';
import ProductCreate from './pages/admin/ProductCreate';
import ProductDetail from './pages/admin/ProductDetail';
import ProductEdit from './pages/admin/ProductEdit';

import './App.css';

// Layout component to wrap public routes
const MainLayout = ({ children }) => (
  <div className="layout-container">
    <Navbar />
    <main className="main-content">
      {children}
    </main>
    <Footer />
  </div>
);

// Admin route guard
const AdminRoute = ({ children }) => {
  return (
    <PrivateRoute role="admin">
      {children}
    </PrivateRoute>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              
              {/* User Routes */}
              <Route path="users" element={<UsersList />} />
              <Route path="users/create" element={<UserCreate />} />
              <Route path="users/:userId" element={<UserDetail />} />
              <Route path="users/:userId/edit" element={<UserEdit />} />
              
              {/* Category Routes */}
              <Route path="categories" element={<CategoriesList />} />
              <Route path="categories/create" element={<CategoryCreate />} />
              <Route path="categories/:categoryId/edit" element={<CategoryEdit />} />
              
              {/* Product Routes */}
              <Route path="products" element={<ProductsList />} />
              <Route path="products/create" element={<ProductCreate />} />
              <Route path="products/:productId" element={<ProductDetail />} />
              <Route path="products/:productId/edit" element={<ProductEdit />} />
            </Route>
            
            {/* Public Routes with Main Layout */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
            <Route path="/product/:productId" element={<MainLayout><ProductDetails /></MainLayout>} />
            <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
            <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
            <Route path="/blog/:blogId" element={<MainLayout><BlogDetail /></MainLayout>} />
            <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
            <Route path="/services/:serviceId" element={<MainLayout><ServiceDetail /></MainLayout>} />
            <Route path="/about" element={<MainLayout><About /></MainLayout>} />
            <Route path="/unauthorized" element={<MainLayout><Unauthorized /></MainLayout>} />

            {/* Protected Routes */}
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <MainLayout><Checkout /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <MainLayout><Orders /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/order-confirmation/:orderId"
              element={
                <PrivateRoute>
                  <MainLayout><OrderConfirmation /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <MainLayout><Dashboard /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/address/add"
              element={
                <PrivateRoute>
                  <MainLayout><AddressForm /></MainLayout>
                </PrivateRoute>
              }
            />

            {/* Catch-all Route */}
            <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
