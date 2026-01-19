import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    // Get userInfo from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log('User Admin Status:', userInfo?.role === 'admin');
    // Check if user exists AND is an admin
    return userInfo && userInfo.role === 'admin' ? (
        <Outlet />
    ) : (
        // If not admin, redirect to login
        <Navigate to='/login' replace />
    );
};

export default AdminRoute;