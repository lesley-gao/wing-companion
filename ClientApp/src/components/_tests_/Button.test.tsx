// ClientApp/src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button } from '../ui/Button';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders button with children', () => {
      renderWithTheme(<Button>Click me</Button>);
      
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with custom test id', () => {
      renderWithTheme(<Button data-testid="custom-button">Test</Button>);
      
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders contained variant by default', () => {
      renderWithTheme(<Button>Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-contained');
    });

    it('renders outlined variant', () => {
      renderWithTheme(<Button variant="outlined">Outlined</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-outlined');
    });

    it('renders text variant', () => {
      renderWithTheme(<Button variant="text">Text</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-text');
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      renderWithTheme(<Button>Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-sizeMedium');
    });

    it('renders small size', () => {
      renderWithTheme(<Button size="small">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-sizeSmall');
    });

    it('renders large size', () => {
      renderWithTheme(<Button size="large">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-sizeLarge');
    });
  });

  describe('Colors', () => {
    it('renders primary color by default', () => {
      renderWithTheme(<Button>Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-containedPrimary');
    });

    it('renders secondary color', () => {
      renderWithTheme(<Button color="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-containedSecondary');
    });

    it('renders error color', () => {
      renderWithTheme(<Button color="error">Error</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-containedError');
    });
  });

  describe('States', () => {
    it('renders disabled state', () => {
      renderWithTheme(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('Mui-disabled');
    });

    it('renders loading state', () => {
      renderWithTheme(<Button loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders loading state with custom loading text', () => {
      renderWithTheme(<Button loading>Saving...</Button>);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('prevents onClick when loading', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button loading onClick={mockOnClick}>Loading</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('prevents onClick when disabled', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button disabled onClick={mockOnClick}>Disabled</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    it('renders start icon', () => {
      const StartIcon = () => <span data-testid="start-icon">Start</span>;
      renderWithTheme(<Button startIcon={<StartIcon />}>With Start Icon</Button>);
      
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });

    it('renders end icon', () => {
      const EndIcon = () => <span data-testid="end-icon">End</span>;
      renderWithTheme(<Button endIcon={<EndIcon />}>With End Icon</Button>);
      
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    it('renders both start and end icons', () => {
      const StartIcon = () => <span data-testid="start-icon">Start</span>;
      const EndIcon = () => <span data-testid="end-icon">End</span>;
      
      renderWithTheme(
        <Button startIcon={<StartIcon />} endIcon={<EndIcon />}>
          With Both Icons
        </Button>
      );
      
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders full width', () => {
      renderWithTheme(<Button fullWidth>Full Width</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-fullWidth');
    });

    it('applies custom className', () => {
      renderWithTheme(<Button className="custom-class">Custom</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Button Types', () => {
    it('renders as submit button', () => {
      renderWithTheme(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders as reset button', () => {
      renderWithTheme(<Button type="reset">Reset</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('renders as button by default', () => {
      renderWithTheme(<Button>Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Link Functionality', () => {
    it('renders as link when href is provided', () => {
      renderWithTheme(<Button href="/test">Link Button</Button>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('opens link in new tab when target is specified', () => {
      renderWithTheme(
        <Button href="/test" target="_blank" rel="noopener noreferrer">
          External Link
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Event Handling', () => {
    it('calls onClick when clicked', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={mockOnClick}>Click me</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button disabled onClick={mockOnClick}>Disabled</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('prevents event propagation when loading', () => {
      const mockOnClick = jest.fn();
      
      renderWithTheme(<Button loading onClick={mockOnClick}>Loading</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper role', () => {
      renderWithTheme(<Button>Accessible</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={mockOnClick}>Keyboard Test</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('maintains focus management', () => {
      renderWithTheme(<Button>Focus Test</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Custom Components', () => {
    it('renders with custom component', () => {
      const CustomComponent = ({ children, ...props }: any) => (
        <div data-testid="custom-component" {...props}>{children}</div>
      );
      
      renderWithTheme(
        <Button component={CustomComponent}>Custom Component</Button>
      );
      
      expect(screen.getByTestId('custom-component')).toBeInTheDocument();
    });
  });
});