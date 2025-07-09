import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import UserProfile from './UserProfile';

const meta: Meta<typeof UserProfile> = {
  title: 'Components/UserProfile',
  component: UserProfile,
};
export default meta;

type Story = StoryObj<typeof UserProfile>;

export const Default: Story = {
  args: {
    user: {
      id: 'user_1',
      name: 'Alice',
      email: 'alice@example.com',
      verified: true,
      role: 'User',
    },
  },
};

export const Unverified: Story = {
  args: {
    user: {
      id: 'user_2',
      name: 'Bob',
      email: 'bob@example.com',
      verified: false,
      role: 'User',
    },
  },
};
