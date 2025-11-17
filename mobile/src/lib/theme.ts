export const colors = {
  primary: '#1f2937', // Dark gray/charcoal - main text, buttons
  primaryHover: '#111827', // Darker shade
  secondary: '#6b7280', // Medium gray - secondary text
  background: '#ffffff',
  lightBackground: '#f9fafb',
  accent: '#f59e0b', // Amber/orange - highlights
  danger: '#ef4444', // Red - errors
  success: '#22c55e', // Green - confirmations
  warning: '#f59e0b',
  info: '#3b82f6', // Blue
  border: '#d1d5db', // Gray-300
  borderLight: '#e5e7eb', // Gray-200
  placeholder: '#9ca3af', // Gray-400

  // Special colors
  heroBg: '#f8d7da', // Light pink
  heroText: '#dc3545', // Red
  bestSellerBg: '#d4e5f7', // Light blue

  // Status colors
  statusPending: {
    bg: '#fef3c7',
    text: '#92400e',
  },
  statusConfirmed: {
    bg: '#dbeafe',
    text: '#1e40af',
  },
  statusShipped: {
    bg: '#f3e8ff',
    text: '#6b21a8',
  },
  statusDelivered: {
    bg: '#d1fae5',
    text: '#065f46',
  },
  statusCancelled: {
    bg: '#fee2e2',
    text: '#991b1b',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  body: {
    fontSize: 16,
    color: colors.primary,
  },
  caption: {
    fontSize: 14,
    color: colors.secondary,
  },
  small: {
    fontSize: 12,
    color: colors.secondary,
  },
};
