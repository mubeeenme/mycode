'use client';

import { cn } from '@/lib/utils';

export interface TypographyProps {
  className?: string;
  children: React.ReactNode;
}

export function H1({ className, children }: TypographyProps) {
  return (
    <h1 className={cn('text-4xl font-bold tracking-tight lg:text-5xl', className)}>
      {children}
    </h1>
  );
}

export function H2({ className, children }: TypographyProps) {
  return (
    <h2 className={cn('text-3xl font-semibold tracking-tight', className)}>
      {children}
    </h2>
  );
}

export function H3({ className, children }: TypographyProps) {
  return (
    <h3 className={cn('text-2xl font-semibold tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function H4({ className, children }: TypographyProps) {
  return (
    <h4 className={cn('text-xl font-semibold tracking-tight', className)}>
      {children}
    </h4>
  );
}

export function P({ className, children }: TypographyProps) {
  return (
    <p className={cn('text-neutral-600 leading-7', className)}>
      {children}
    </p>
  );
}

export function Lead({ className, children }: TypographyProps) {
  return (
    <p className={cn('text-xl text-neutral-600', className)}>
      {children}
    </p>
  );
}

export function Muted({ className, children }: TypographyProps) {
  return (
    <p className={cn('text-sm text-neutral-500', className)}>
      {children}
    </p>
  );
}