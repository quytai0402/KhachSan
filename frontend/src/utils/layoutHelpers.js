import React from 'react';
import { DashboardLayout } from '../components/dashboard';

/**
 * Hàm bao bọc component để sử dụng DashboardLayout
 * Giúp thống nhất giao diện và hoạt động giữa các trang admin và staff
 * 
 * @param {React.Component} Component - Component sẽ được bọc trong layout
 * @param {string} pageTitle - Tiêu đề của trang hiển thị trên header
 * @returns {React.Component} - Component mới với layout
 */
export const withDashboardLayout = (Component, pageTitle) => {
  return (props) => (
    <DashboardLayout title={pageTitle}>
      <Component {...props} />
    </DashboardLayout>
  );
};

/**
 * Giúp tạo tên hiển thị cho component được tạo bởi withDashboardLayout
 * 
 * @param {string} componentName - Tên gốc của component
 * @returns {string} - Tên hiển thị mới
 */
export const getLayoutComponentName = (componentName) => {
  return `WithLayout(${componentName})`;
}; 