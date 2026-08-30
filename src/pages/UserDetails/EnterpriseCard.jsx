import React from 'react';
import { motion } from 'framer-motion';

export const EnterpriseCard = ({
  children,
  className = '',
  hoverEffect = true,
  shadow = 'none', // flat enterprise cards: a subtle border, not a shadow
  ...props
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -2 } : {}}
      className={`bg-white rounded-xl border border-gray-200 ${shadowClasses[shadow] || ''} overflow-x-auto max-w-full ${className}`}
      style={{ whiteSpace: 'nowrap' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};