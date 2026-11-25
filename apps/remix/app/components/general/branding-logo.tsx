import type { HTMLAttributes } from 'react';

export type LogoProps = HTMLAttributes<HTMLSpanElement>;

export const BrandingLogo = ({ className, ...props }: LogoProps) => (
  <span className={`inline-flex items-center whitespace-nowrap font-bold tracking-tight ${className ?? ''}`} {...props}>
    Premier Lending <span className="ml-1 text-primary">Esign</span>
  </span>
);
