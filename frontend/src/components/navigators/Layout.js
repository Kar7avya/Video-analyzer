import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../navigators/Header';
import Footer from '../navigators/Footer';

function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="flex-grow-1" style={{ paddingTop: '70px' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
