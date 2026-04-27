import React from 'react';
import Button from '../components/Button';

export default {
  title: 'Primitives / Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'secondary', 'danger', 'dark', 'white'],
      description: 'Visual style of the button',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    loading: { control: 'boolean', description: 'Shows spinner and disables click' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export const Default = {
  args: {
    children: 'Add to Cart',
    variant: 'solid',
    size: 'md',
  },
};

export const Outline = {
  args: { children: 'Save to Wishlist', variant: 'outline', size: 'md' },
};

export const Ghost = {
  args: { children: 'Learn More', variant: 'ghost', size: 'md' },
};

export const Secondary = {
  args: { children: 'Browse Catalogue', variant: 'secondary', size: 'md' },
};

export const Danger = {
  args: { children: 'Remove Item', variant: 'danger', size: 'md' },
};

export const Dark = {
  args: { children: 'Go to Checkout', variant: 'dark', size: 'md' },
};

export const White = {
  args: { children: 'Cancel', variant: 'white', size: 'md' },
  parameters: { backgrounds: { default: 'neutral' } },
};

export const Loading = {
  args: { children: 'Processing…', variant: 'solid', size: 'md', loading: true },
};

export const Disabled = {
  args: { children: 'Out of Stock', variant: 'solid', size: 'md', disabled: true },
};

export const SizeSmall = {
  args: { children: 'Small', variant: 'solid', size: 'sm' },
};

export const SizeLarge = {
  args: { children: 'Large', variant: 'solid', size: 'lg' },
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      {['solid', 'outline', 'ghost', 'secondary', 'danger', 'dark', 'white'].map((v) => (
        <Button key={v} variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
