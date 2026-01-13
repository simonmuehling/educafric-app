import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { GraduationCap } from 'lucide-react';

const LOGO_PATHS = [
  '/educafric-logo-128.png',
  '/educafric-logo-512.png',
  '/favicon.ico'
];

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo = ({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  const baseUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (host.includes('educafric.com')) {
        return 'https://educafric.com';
      }
      return window.location.origin;
    }
    return '';
  }, []);

  const logoSources = useMemo(() => {
    return LOGO_PATHS.map(path => `${baseUrl}${path}`);
  }, [baseUrl]);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const handleImageError = () => {
    if (currentSourceIndex < logoSources.length - 1) {
      setCurrentSourceIndex(currentSourceIndex + 1);
    } else {
      setImageError(true);
    }
  };

  return (
    <Link 
      href="/" 
      className={`flex items-center transition-all duration-200 hover:opacity-80 ${className}`}
      data-testid="logo-link"
    >
      <div className={`${sizeClasses[size]} overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center`}>
        {!imageError ? (
          <img 
            src={logoSources[currentSourceIndex]} 
            alt="Educafric Logo" 
            className="w-full h-full object-contain rounded-full"
            onError={handleImageError}
            loading="eager"
          />
        ) : (
          <GraduationCap className={`${iconSizeClasses[size]} text-white`} />
        )}
      </div>
      {showText && (
        <span className={`ml-2 font-bold text-primary ${textSizeClasses[size]}`}>
          Educafric
        </span>
      )}
    </Link>
  );
};

export default Logo;
