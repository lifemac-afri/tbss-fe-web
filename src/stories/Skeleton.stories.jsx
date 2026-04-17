import React from 'react';
import Skeleton, { SkeletonCard } from '../components/Skeleton';

export default {
  title: 'Primitives / Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['rect', 'circle', 'text'],
      description: 'Shape of the skeleton placeholder',
    },
    className: { control: 'text', description: 'Tailwind classes for sizing' },
  },
};

export const Rect = {
  args: { variant: 'rect', className: 'w-48 h-12' },
};

export const Circle = {
  args: { variant: 'circle', className: 'w-12 h-12' },
};

export const Text = {
  args: { variant: 'text', className: 'w-64' },
};

export const TextBlock = {
  render: () => (
    <div className="space-y-2 w-64">
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-4/5" />
      <Skeleton variant="text" className="w-3/5" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const BookCardSkeleton = {
  render: () => (
    <div className="w-[200px]">
      <SkeletonCard />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const BookCardGrid = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[180px]">
          <SkeletonCard />
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true }, layout: 'padded' },
};
