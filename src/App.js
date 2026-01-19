import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import ProductScreen from './pages/ProductScreen';
import Navbar from './components/Navbar';
import { CartProvider } from './components/context/CartContext'; 
import CartScreen from './pages/CartScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import ShippingScreen from './pages/ShippingScreen';
// import PaymentScreen from './pages/PaymentScreen';
import PlaceOrderScreen from './pages/PlaceOrderScreen';
import ProfileScreen from './pages/ProfileScreen';
import OrderDetailsScreen from './pages/OrderDetailsScreen';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import CheckoutSteps from './components/CheckoutSteps';
import MyOrdersScreen from './pages/MyOrdersScreen';  
import SuccessScreen from './pages/SuccessScreen';

import AdminRoute from './Routes/AdminRoute';
import OrderListScreen from './pages/AdminPages/OrderListScreen';
import ProductListScreen from './pages/AdminPages/ProductListScreen';
import DashboardScreen from './pages/AdminPages/DashboardScreen';
import NotFoundScreen from './pages/NotFoundScreen';
import ProductCreateScreen from './pages/AdminPages/ProductCreateScreen';
import ProductEditScreen from './pages/AdminPages/ProductEditScreen';
import CouponListScreen from './pages/AdminPages/CouponListScreen';
import AdminLayout from './pages/AdminPages/AdminLayout';
import UserListScreen from './pages/AdminPages/UserListScreen';


function App() {
  return (
    // 2. Wrap everything inside CartProvider
    <CartProvider> 
      {/* Replace YOUR_PAYPAL_CLIENT_ID with your real PayPal client ID below */}
      <PayPalScriptProvider options={{ "client-id": "REPLACE_WITH_YOUR_REAL_PAYPAL_CLIENT_ID" }}>
        <Router>
          <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar />
            <main className="container py-5 flex-grow-1">
              <ToastContainer position="top-center" autoClose={3000} />
              <Routes>
                <Route path="/" element={<HomeScreen />} exact />
                <Route path="/product/:id" element={<ProductScreen />} />
                <Route path="/cart" element={<CartScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
                <Route path='/shipping' element={<ShippingScreen />} />
                <Route path='/profile' element={<ProfileScreen />} />
                <Route path='/placeorder' element={<PlaceOrderScreen />} />
                <Route path='/myorders' element={<MyOrdersScreen />} />
                <Route path='/order/:id' element={<OrderDetailsScreen />} />
                <Route path='/checkout' element={<CheckoutSteps step1 step2 step4 />} />
                <Route path='/success' element={<SuccessScreen />} />

                {/* ADMIN ONLY ROUTES */}
                {/* Admin Protected Routes */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route path='/admin' element={<AdminLayout />}>
                    <Route path='dashboard' element={<DashboardScreen />} />
                    <Route path="addproducts" element={<ProductCreateScreen />} />
                    <Route path='productlist' element={<ProductListScreen />} />
                    <Route path="orderlist" element={<OrderListScreen />} />
                    <Route path="product/:id/edit" element={<ProductEditScreen />} />
                    <Route path='couponlist' element={<CouponListScreen />} />
                    <Route path='userlist' element={<UserListScreen />} />
                  </Route>
                </Route>

                {/* Catch-all for 404s */}
                <Route path="*" element={<NotFoundScreen />} />

              </Routes> 
            </main>
          </div>
        </Router>
      </PayPalScriptProvider>
    </CartProvider>
  );
}

export default App;


