import React from 'react';
import BookCard from '../components/BookCard';
import CartContext from '../context/CartContext';
import WishlistContext from '../context/WishlistContext';

// Provide lightweight mock context values so BookCard renders
// without real auth or API calls.
const mockCart = (inCart = false) => ({
  cartItems: inCart ? [{ id: 'book-1' }] : [],
  openAddToCartModal: () => {},
  openCart: () => {},
});

const mockWishlist = (wishlisted = false) => ({
  isInWishlist: () => wishlisted,
  toggleWishlist: () => {},
});

const withMockContexts =
  ({ wishlisted = false, inCart = false } = {}) =>
  (Story) => (
    <CartContext.Provider value={mockCart(inCart)}>
      <WishlistContext.Provider value={mockWishlist(wishlisted)}>
        <Story />
      </WishlistContext.Provider>
    </CartContext.Provider>
  );

const COVER =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop';
const COVER_2 =
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop';
const COVER_3 =
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop';

const baseArgs = {
  id: 'book-1',
  title: 'Nearly All The Men In Lagos Are Mad',
  author: 'Damilare Kuku',
  rating: 4.3,
  reviews: 271,
  price: 145,
  tag: 'Paperback',
  coverImage: COVER,
};

export default {
  title: 'Product / BookCard',
  component: BookCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [withMockContexts()],
  argTypes: {
    tag: { control: 'radio', options: ['Paperback', 'Hardcover'] },
    stockStatus: {
      control: 'select',
      options: [undefined, 'Out of stock'],
      description: 'Stock availability — "Out of stock" shows overlay and disables cart button',
    },
    rating: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
    price: { control: { type: 'number', min: 1 } },
    oldPrice: { control: 'text', description: 'Original price — triggers discount ribbon when set' },
    discount: { control: 'text', description: 'Override discount label (e.g. "20% OFF")' },
  },
};

export const Default = {
  args: { ...baseArgs },
};

export const WithDiscount = {
  args: {
    ...baseArgs,
    id: 'book-2',
    title: 'Americanah',
    author: 'Chimamanda Ngozi Adichie',
    price: 120,
    oldPrice: 160,
    coverImage: COVER_2,
    rating: 4.7,
    reviews: 512,
  },
};

export const Hardcover = {
  args: {
    ...baseArgs,
    tag: 'Hardcover',
    price: 220,
  },
};

export const OutOfStock = {
  args: {
    ...baseArgs,
    stockStatus: 'Out of stock',
  },
};

export const Wishlisted = {
  decorators: [withMockContexts({ wishlisted: true })],
  args: { ...baseArgs },
};

export const InCart = {
  decorators: [withMockContexts({ inCart: true })],
  args: { ...baseArgs },
};

export const CardGrid = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <BookCard {...baseArgs} />
      <BookCard
        {...baseArgs}
        id="book-2"
        title="Americanah"
        author="Chimamanda Ngozi Adichie"
        price={120}
        oldPrice={160}
        coverImage={COVER_2}
        rating={4.7}
        reviews={512}
      />
      <BookCard
        {...baseArgs}
        id="book-3"
        title="Purple Hibiscus"
        author="Chimamanda Ngozi Adichie"
        coverImage={COVER_3}
        stockStatus="Out of stock"
      />
    </div>
  ),
  decorators: [withMockContexts()],
  parameters: { layout: 'padded', controls: { disable: true } },
};
