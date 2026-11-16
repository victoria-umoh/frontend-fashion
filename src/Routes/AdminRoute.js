import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    let userInfo = null;
    try {
        userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch {
        localStorage.removeItem('userInfo');
    }

    return userInfo?.role === 'admin' ? (
        <Outlet />
    ) : (
        <Navigate to='/login' replace />
    );
};

export default AdminRoute;