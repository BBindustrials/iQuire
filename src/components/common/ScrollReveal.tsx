// ============================================================================
// iQuire — ScrollReveal wrapper (uses global CSS classes)
// ============================================================================

import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

type AnimationType = 'up' | 'down' | 'left' | 'right' | 'fade' | 'zoom';
type AnimationDelay = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: AnimationDelay;
  stagger?: boolean;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'up',
  delay = 0,
  stagger = false,
  className = '',
}) => {
  const ref = useScrollReveal<HTMLDivElement>();

  const classes = [
    'scroll-reveal',
    `anim-${animation}`,
    delay > 0 ? `delay-${delay}` : '',
    stagger ? 'stagger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
};