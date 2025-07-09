import Receipt from './Receipt';
import { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Receipt> = {
  title: 'Components/Receipt',
  component: Receipt,
};
export default meta;

type Story = StoryObj<typeof Receipt>;

export const Default: Story = {
  args: {
    receipt: {
      receiptId: 'rcpt_123',
      paymentIntentId: 'pi_123',
      userEmail: 'alice@example.com',
      amount: 100,
      currency: 'NZD',
      paidAt: '2025-07-10T12:00:00Z',
      serviceType: 'Airport Pickup',
      pdfUrl: undefined,
    },
  },
};

export const Paid: Story = {
  args: {
    receipt: {
      receiptId: 'rcpt_456',
      paymentIntentId: 'pi_456',
      userEmail: 'charlie@example.com',
      amount: 200,
      currency: 'NZD',
      paidAt: '2025-07-10T15:00:00Z',
      serviceType: 'Flight Companion',
      pdfUrl: undefined,
    },
  },
};
