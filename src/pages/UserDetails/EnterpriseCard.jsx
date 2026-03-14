import React from 'react';
import { motion } from 'framer-motion';
import { colorPalette } from './enterpriseUI.constants';

export const EnterpriseCard = ({
  children,
  className = '',
  hoverEffect = true,
  border = false,
  shadow = 'md',
  ...props
}) => {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, boxShadow: `0 10px 25px -5px rgba(0,0,0,0.1)` } : {}}
      className={`bg-white rounded-xl ${shadowClasses[shadow]} ${
        border ? `border border-${colorPalette.neutral[200]}` : ''
      } overflow-x-auto max-w-full ${className}`}
      style={{ whiteSpace: 'nowrap' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};