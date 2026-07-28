import { theme } from "../../config/theme";

type LogoProps = {
  size?: number;
  className?: string;
};

// The one place in the app that references the logo file path. Every other
// usage (header, splash, favicon) goes through this component or theme.logo.
export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <img
      src={theme.logo}
      alt={`${theme.appNameEn} 로고`}
      width={size}
      height={size}
      className={`rounded-xl object-cover ${className}`}
    />
  );
}
