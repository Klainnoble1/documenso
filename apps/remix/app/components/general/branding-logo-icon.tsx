import LogoImage from '@documenso/assets/logo_icon.png';
import type { ImgHTMLAttributes } from 'react';

export type LogoProps = ImgHTMLAttributes<HTMLImageElement>;

export const BrandingLogoIcon = (props: LogoProps) => <img src={LogoImage} alt="Premier Lending Esign" {...props} />;
