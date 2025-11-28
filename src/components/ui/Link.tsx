'use client';

import NextLink from 'next/link';
import { cn } from '@/lib/utils';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

export function Link({ href, children, className, prefetch = true, ...props }: LinkProps) {
  return (
    <NextLink
      href={href}
      className={cn(
        'text-primary-600 hover:text-primary-700 transition-colors',
        className
      )}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </NextLink>
  );
}