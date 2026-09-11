// Design System Types

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonColor = 'green' | 'gold';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'none';
}