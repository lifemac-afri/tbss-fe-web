import React from 'react';
import Badge from '../components/Badge';

export default {
  title: 'Primitives / Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info', 'dark'],
      description: 'Color scheme of the badge',
    },
    children: { control: 'text' },
  },
};

export const Default = {
  args: { children: 'Default', variant: 'default' },
};

export const Primary = {
  args: { children: 'New Arrival', variant: 'primary' },
};

export const Success = {
  args: { children: 'In Stock', variant: 'success' },
};

export const Warning = {
  args: { children: 'Low Stock', variant: 'warning' },
};

export const Danger = {
  args: { children: 'Out of Stock', variant: 'danger' },
};

export const Info = {
  args: { children: 'Pre-Order', variant: 'info' },
};

export const Dark = {
  args: { children: 'Bestseller', variant: 'dark' },
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">New Arrival</Badge>
      <Badge variant="success">In Stock</Badge>
      <Badge variant="warning">Low Stock</Badge>
      <Badge variant="danger">Out of Stock</Badge>
      <Badge variant="info">Pre-Order</Badge>
      <Badge variant="dark">Bestseller</Badge>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
