import React, { useState } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';

export default {
  title: 'Overlays / Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Max-width of the modal panel',
    },
    title: { control: 'text' },
    isOpen: { control: 'boolean' },
  },
};

const ModalWithTrigger = ({ size, title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} size={size} title={title}>
        {children}
      </Modal>
    </>
  );
};

export const Default = {
  render: () => (
    <ModalWithTrigger title="Order Summary" size="md">
      <p className="text-sm text-gray-600">
        Your order has been placed successfully. You will receive a confirmation email shortly.
      </p>
      <div className="mt-4 flex gap-3 justify-end">
        <Button variant="ghost" size="sm">Close</Button>
        <Button size="sm">View Orders</Button>
      </div>
    </ModalWithTrigger>
  ),
};

export const Small = {
  render: () => (
    <ModalWithTrigger title="Confirm Delete" size="sm">
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to remove this item from your wishlist?
      </p>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button variant="danger" size="sm">Remove</Button>
      </div>
    </ModalWithTrigger>
  ),
};

export const Large = {
  render: () => (
    <ModalWithTrigger title="Book Preview" size="lg">
      <div className="flex gap-6">
        <img
          src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop"
          alt="Book cover"
          className="w-32 h-44 object-cover rounded-xl"
        />
        <div>
          <h4 className="font-bold text-gray-900 mb-1">Nearly All The Men In Lagos Are Mad</h4>
          <p className="text-sm text-gray-500 mb-3">Damilare Kuku</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            A hilarious, frank, and tender collection of short stories set in Lagos, exploring love,
            lust, betrayal, and the relentless pursuit of happiness in one of Africa's most vibrant cities.
          </p>
        </div>
      </div>
    </ModalWithTrigger>
  ),
};

export const NoTitle = {
  render: () => (
    <ModalWithTrigger size="md">
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Added to Cart!</h3>
        <p className="text-sm text-gray-500">Head to checkout when you're ready.</p>
        <Button className="mt-4 w-full">Go to Checkout</Button>
      </div>
    </ModalWithTrigger>
  ),
};
