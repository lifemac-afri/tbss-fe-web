import React from 'react';
import { Mail, Lock, Search, User } from 'lucide-react';
import Input from '../components/Input';

export default {
  title: 'Primitives / Input',
  component: Input,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search'],
    },
    error: { control: 'text', description: 'Error message to display' },
    helperText: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export const Default = {
  args: {
    label: 'Full Name',
    placeholder: '',
  },
};

export const WithIcon = {
  args: {
    label: 'Email Address',
    type: 'email',
    icon: <Mail size={16} />,
  },
};

export const Password = {
  args: {
    label: 'Password',
    type: 'password',
    icon: <Lock size={16} />,
  },
};

export const WithError = {
  args: {
    label: 'Email Address',
    type: 'email',
    icon: <Mail size={16} />,
    error: 'Please enter a valid email address',
    value: 'not-an-email',
  },
};

export const WithHelperText = {
  args: {
    label: 'Username',
    icon: <User size={16} />,
    helperText: 'Must be at least 4 characters',
  },
};

export const Required = {
  args: {
    label: 'Email Address',
    type: 'email',
    required: true,
  },
};

export const SearchInput = {
  args: {
    label: 'Search books…',
    type: 'search',
    icon: <Search size={16} />,
  },
};

export const NoLabel = {
  args: {
    placeholder: 'Enter promo code',
  },
};
