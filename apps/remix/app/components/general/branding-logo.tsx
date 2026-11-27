import LogoImage from '@documenso/assets/logo.png';
import type { HTMLAttributes } from 'react';

export type LogoProps = HTMLAttributes<HTMLSpanElement>;

export const BrandingLogo = ({ className, ...props }: LogoProps) => (
  <span
    className={`inline-flex h-auto items-center gap-2 whitespace-nowrap font-bold tracking-tight ${className ?? ''}`}
    {...props}
  >
    <img src={LogoImage} alt="" className="h-[1.5em] w-auto shrink-0" />
    <span>
      Premier Lending <span className="text-primary">Esign</span>
    </span>
  </span>
);
