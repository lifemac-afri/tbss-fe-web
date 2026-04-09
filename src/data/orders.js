import { trendingBooks, allBooks } from './books';

export const mockOrders = [
  {
    id: 'TBS-2026-001',
    date: 'Mar 28, 2026',
    placedAt: '2026-03-28T10:24:00',
    status: 'Delivered',
    deliveredAt: 'Mar 30, 2026',
    trackingCode: 'GH-KL-88234',
    delivery: 15,
    items: [
      { ...trendingBooks[0], qty: 2 },
      { ...trendingBooks[2], qty: 1 },
    ],
    address: {
      name: 'Kwame Mensah',
      phone: '+233 24 000 0001',
      street: '12 Liberation Road',
      city: 'Accra',
      region: 'Greater Accra',
    },
    paymentMethod: 'MTN Mobile Money',
  },
  {
    id: 'TBS-2026-002',
    date: 'Apr 1, 2026',
    placedAt: '2026-04-01T14:05:00',
    status: 'Dispatched',
    deliveredAt: null,
    trackingCode: 'GH-KL-88411',
    delivery: 15,
    items: [
      { ...trendingBooks[1], qty: 1 },
    ],
    address: {
      name: 'Kwame Mensah',
      phone: '+233 24 000 0001',
      street: '12 Liberation Road',
      city: 'Accra',
      region: 'Greater Accra',
    },
    paymentMethod: 'Visa Card',
  },
  {
    id: 'TBS-2026-003',
    date: 'Apr 5, 2026',
    placedAt: '2026-04-05T09:12:00',
    status: 'Processing',
    deliveredAt: null,
    trackingCode: 'GH-KL-88520',
    delivery: 15,
    items: [
      { ...trendingBooks[3], qty: 1 },
      { ...trendingBooks[4], qty: 1 },
    ],
    address: {
      name: 'Kwame Mensah',
      phone: '+233 24 000 0001',
      street: '12 Liberation Road',
      city: 'Accra',
      region: 'Greater Accra',
    },
    paymentMethod: 'Vodafone Cash',
  },
  {
    id: 'TBS-2026-004',
    date: 'Feb 14, 2026',
    placedAt: '2026-02-14T11:30:00',
    status: 'Cancelled',
    deliveredAt: null,
    trackingCode: null,
    delivery: 15,
    items: [
      { ...trendingBooks[5], qty: 1 },
    ],
    address: {
      name: 'Kwame Mensah',
      phone: '+233 24 000 0001',
      street: '12 Liberation Road',
      city: 'Accra',
      region: 'Greater Accra',
    },
    paymentMethod: 'MTN Mobile Money',
  },
];

export const statusConfig = {
  Processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500', label: 'Processing' },
  Dispatched: { color: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-500', label: 'Dispatched' },
  Delivered: { color: 'text-green-600 bg-green-50 border-green-200', dot: 'bg-green-500', label: 'Delivered' },
  Cancelled: { color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-400', label: 'Cancelled' },
};

export const getOrderTotal = (order) =>
  order.items.reduce((sum, i) => sum + i.price * i.qty, 0) + order.delivery;
