import PaymentForm from './PaymentForm';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_12345'); // Replace with your test key

const meta: Meta<typeof PaymentForm> = {
  title: 'Components/PaymentForm',
  component: PaymentForm,
};
export default meta;

type Story = StoryObj<typeof PaymentForm>;

export const Default: Story = {
  render: () => (
    <Elements stripe={stripePromise} options={{ clientSecret: 'test_client_secret' }}>
      <PaymentForm paymentIntentClientSecret="test_client_secret" />
    </Elements>
  ),
};

export const FilledAndSubmit: Story = {
  render: () => (
    <Elements stripe={stripePromise} options={{ clientSecret: 'test_client_secret' }}>
      <PaymentForm paymentIntentClientSecret="test_client_secret" />
    </Elements>
  ),
  play: async ({ canvasElement }) => {
    // Example: fill and submit form (customize as needed)
    // const canvas = within(canvasElement);
    // await userEvent.type(canvas.getByLabelText('Card number'), '4242424242424242');
    // await userEvent.click(canvas.getByRole('button', { name: /pay/i }));
  },
};
