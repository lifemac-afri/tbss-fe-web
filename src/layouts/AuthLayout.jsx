import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import logo from '../assets/logo/logo.png';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-poppins">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <Link to="/" className="inline-block">
          <img src={logo} alt="TBSS Logo" className="h-9 w-auto" />
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} TBSS. All rights reserved.
        <span className="mx-2">·</span>
        <Link to="/privacy" className="hover:text-gray-600">Privacy</Link>
        <span className="mx-2">·</span>
        <Link to="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  );
};

export default AuthLayout;
