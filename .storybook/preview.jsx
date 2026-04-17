import '../src/index.css';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="font-poppins">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    a11y: {
      test: 'todo',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#F9FAFB' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
};

export default preview;
