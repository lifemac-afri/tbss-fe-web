import React from 'react';
import Spinner from '../components/Spinner';

export default {
  title: 'Primitives / Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Controls width and height of the spinner',
    },
  },
};

export const Small = { args: { size: 'sm' } };
export const Medium = { args: { size: 'md' } };
export const Large = { args: { size: 'lg' } };
export const ExtraLarge = { args: { size: 'xl' } };

export const AllSizes = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <Spinner size="sm" />
        <span className="text-xs text-gray-400">sm</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Spinner size="md" />
        <span className="text-xs text-gray-400">md</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Spinner size="lg" />
        <span className="text-xs text-gray-400">lg</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Spinner size="xl" />
        <span className="text-xs text-gray-400">xl</span>
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const InContext = {
  render: () => (
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <Spinner size="sm" />
      Loading your library…
    </div>
  ),
  parameters: { controls: { disable: true } },
};
