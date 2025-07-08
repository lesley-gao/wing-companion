// ClientApp/src/components/ui/Modal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Slide,
  Fade,
  Zoom,
  Grow,
  Paper,
  Backdrop,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { styled } from '@mui/material/styles';
import { SxProps, Theme } from '@mui/material/styles';

// TypeScript interfaces
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  fullScreen?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  showCloseButton?: boolean;
  transition?: 'fade' | 'slide' | 'zoom' | 'grow';
  className?: string;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
  scroll?: 'paper' | 'body';
  dividers?: boolean;
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
}

export interface ModalContentProps {
  children: React.ReactNode;
  dividers?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
}

export interface ModalActionsProps {
  children: React.ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
}

// Transition components
const SlideTransition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  }
);

const ZoomTransition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Zoom ref={ref} {...props} />;
  }
);

const GrowTransition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Grow ref={ref} {...props} />;
  }
);

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(1.5), // 12px
    boxShadow: theme.shadows[16],
    margin: theme.spacing(2),
    maxHeight: 'calc(100vh - 32px)',
  },
  
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  
  '& .MuiTypography-root': {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.2,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  
  '&.MuiDialogContent-dividers': {
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3, 3),
  gap: theme.spacing(1),
  
  '& .MuiButton-root': {
    minWidth: theme.spacing(10),
  },
}));

// Get transition component
const getTransitionComponent = (transition: string) => {
  switch (transition) {
    case 'slide':
      return SlideTransition;
    case 'zoom':
      return ZoomTransition;
    case 'grow':
      return GrowTransition;
    default:
      return Fade;
  }
};

// Modal Header component
const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  onClose,
  showCloseButton = true,
  className = '',
  sx,
  ...props
}) => {
  return (
    <StyledDialogTitle
      className={`${className} bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`.trim()}
      sx={sx}
      {...props}
    >
      <div>{children}</div>
      {showCloseButton && onClose && (
        <IconButton
          onClick={onClose}
          size="small"
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          sx={{ ml: 2 }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </StyledDialogTitle>
  );
};

// Modal Content component
const ModalContent: React.FC<ModalContentProps> = ({
  children,
  dividers = false,
  className = '',
  sx,
  ...props
}) => {
  return (
    <StyledDialogContent
      dividers={dividers}
      className={`${className} text-gray-900 dark:text-white bg-white dark:bg-gray-800`.trim()}
      sx={sx}
      {...props}
    >
      {children}
    </StyledDialogContent>
  );
};

// Modal Actions component
const ModalActions: React.FC<ModalActionsProps> = ({
  children,
  className = '',
  sx,
  ...props
}) => {
  return (
    <StyledDialogActions
      className={`${className} bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700`.trim()}
      sx={sx}
      {...props}
    >
      {children}
    </StyledDialogActions>
  );
};

// Main Modal component
const ModalComponent: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  title,
  subtitle,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  showCloseButton = true,
  transition = 'fade',
  className = '',
  sx,
  'data-testid': testId,
  scroll = 'paper',
  dividers = false,
  ...props
}) => {
  const handleClose = (_: any, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' && disableBackdropClick) return;
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) return;
    onClose();
  };

  const TransitionComponent = getTransitionComponent(transition);

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={TransitionComponent}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      scroll={scroll}
      className={`${className}`.trim()}
      sx={sx}
      data-testid={testId}
      slots={{
        backdrop: Backdrop,
      }}
      slotProps={{
        backdrop: {
          className: 'bg-black/50 backdrop-blur-sm',
        },
      }}
      {...props}
    >
      <Paper className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Header */}
        {(title || showCloseButton) && (
          <StyledDialogTitle className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div>
              {title && (
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </div>
              )}
              {subtitle && (
                <DialogContentText className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {subtitle}
                </DialogContentText>
              )}
            </div>
            {showCloseButton && (
              <IconButton
                onClick={onClose}
                size="small"
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                sx={{ ml: 2 }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </StyledDialogTitle>
        )}

        {/* Content */}
        <StyledDialogContent
          dividers={dividers}
          className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
        >
          {children}
        </StyledDialogContent>

        {/* Actions */}
        {actions && (
          <StyledDialogActions className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {actions}
          </StyledDialogActions>
        )}
      </Paper>
    </StyledDialog>
  );
};

// Create the compound component using Object.assign
export const Modal = Object.assign(ModalComponent, {
  Header: ModalHeader,
  Content: ModalContent,
  Actions: ModalActions,
});

// Export individual components as well
export { ModalHeader, ModalContent, ModalActions };

export default Modal;