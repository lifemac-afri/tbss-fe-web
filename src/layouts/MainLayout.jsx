import React from 'react';
import { Outlet } from 'react-router-dom';
import MainNav from '../components/MainNav';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import AddToCartModal from '../components/AddToCartModal';
import WishlistDrawer from '../components/WishlistDrawer';
import CookieConsentBanner from '../components/CookieConsentBanner';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-poppins overflow-x-hidden">
      <MainNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <AddToCartModal />
      <CookieConsentBanner />
    </div>
  );
};

export default MainLayout;
