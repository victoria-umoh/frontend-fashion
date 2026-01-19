import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="d-flex">
      {/* Side Navigation - Fixed on left */}
      <AdminSidebar />

      {/* Main Content Area - Changes based on route */}
      <main className="flex-grow-1 p-4 bg-light min-vh-100">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;