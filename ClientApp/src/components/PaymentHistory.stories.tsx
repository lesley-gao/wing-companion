import PaymentHistory from './PaymentHistory';
import { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof PaymentHistory> = {
  title: 'Components/PaymentHistory',
  component: PaymentHistory,
};
export default meta;

type Story = StoryObj<typeof PaymentHistory>;

export const Default: Story = {
  args: {
    userId: 'user_1',
  },
};
