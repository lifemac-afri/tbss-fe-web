import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-aclonica text-[#F46B03] mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-500 text-sm mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="solid" size="lg" className="rounded-full">Go Home</Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" size="lg" className="rounded-full">Browse Shop</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
