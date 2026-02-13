import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  titleClassName = '',
}) => {
  return (
    <div className={`bg-[var(--card-bg)] rounded-lg shadow-md p-6 ${className}`}>
      {title && (
        <h3 className={`text-xl font-semibold mb-4 ${titleClassName || 'text-gray-800'}`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
