import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useStableCallback } from '@/hooks/useStableCallback';

interface StableButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

/**
 * Wrapper du Button avec onClick stable qui survit aux redémarrages serveur
 * Stable Button wrapper that preserves onClick functionality during server restarts
 */
export const StableButton: React.FC<StableButtonProps> = ({ 
  onClick, 
  children, 
  ...props 
}) => {
  // Preserve onClick callback across re-renders and server restarts
  const stableOnClick = useStableCallback(onClick || (() => {}));
  
  return (
    <Button 
      {...props} 
      onClick={onClick ? stableOnClick : undefined}
    >
      {children}
    </Button>
  );
};

export default StableButton;