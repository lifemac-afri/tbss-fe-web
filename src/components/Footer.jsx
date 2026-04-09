import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo/logo.png';
import { Mail, Phone, MapPin } from 'lucide-react';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const footerLinks = {
  Shop: [
    { label: 'All Books', href: '/shop' },
    { label: 'Bestsellers', href: '/shop?sort=bestsellers' },
    { label: 'New Releases', href: '/shop?sort=newest' },
    { label: 'Stationery', href: '/shop?category=stationery' },
    { label: 'Games', href: '/shop?category=games' },
  ],
  Community: [
    { label: 'Virtual Book Clubs', href: '/community/book-clubs' },
    { label: 'Book Reviews', href: '/community/reviews' },
    { label: 'Events', href: '/community/events' },
    { label: 'Blog', href: '/blog' },
  ],
  Services: [
    { label: 'Reading Plans', href: '/services/reading-plan' },
    { label: 'Gift Cards', href: '/services/gift-cards' },
    { label: 'Bulk Orders', href: '/services/bulk-orders' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
    { label: 'My Orders', href: '/dashboard/orders' },
    { label: 'Wishlist', href: '/dashboard/wishlist' },
    { label: 'Account Settings', href: '/dashboard/account' },
  ],
};

const socials = [
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube' },
];

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-10 border-b border-neutral-700">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img src={logo} alt="TBSS Logo" className="h-10 w-auto mb-4 brightness-0 invert" />
            <p className="text-neutral-400 text-sm leading-relaxed mb-5 max-w-xs">
              Your premier destination for books, stationery, and games in Ghana. Discover, read, and share stories that matter.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin size={14} className="flex-shrink-0 text-[#F46B03]" />
                <span>Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Phone size={14} className="flex-shrink-0 text-[#F46B03]" />
                <span>+233 XX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Mail size={14} className="flex-shrink-0 text-[#F46B03]" />
                <span>hello@tbss.com</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-neutral-400 hover:text-[#F46B03] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} TBSS. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-400 hover:bg-[#F46B03] hover:text-white transition-all"
              >
                <Icon />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <Link to="/privacy" className="hover:text-[#F46B03]">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#F46B03]">Terms of Service</Link>
            <Link to="/privacy#cookies" className="hover:text-[#F46B03]">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
