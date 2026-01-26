// src/components/ui/Avatar.tsx

import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square' | 'rounded';
  className?: string;
  children?: React.ReactNode;
  fallback?: string;
  onClick?: () => void;
  bordered?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  shape = 'circle',
  className = '',
  children,
  fallback,
  onClick,
  bordered = false,
  status,
}) => {
  // Size mapping
  const sizeClasses = {
    xs: 'h-8 w-8',
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
    '2xl': 'h-32 w-32',
  };

  // Shape mapping
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  // Border classes
  const borderClass = bordered ? 'border-2 border-white shadow-md' : '';

  // Status color mapping
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  // Status size mapping (relative to avatar)
  const statusSize = {
    xs: 'h-2 w-2',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
    '2xl': 'h-5 w-5',
  };

  // Generate initials from fallback text
  const getInitials = (text: string) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Background colors for initials
  const getBackgroundColor = (initials: string) => {
    if (!initials) return 'bg-gray-200';
    
    // Generate consistent color based on initials
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
      'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500',
    ];
    
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Determine text size for initials
  const getTextSize = (size: string) => {
    switch (size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-xl';
      case 'xl': return 'text-2xl';
      case '2xl': return 'text-3xl';
      default: return 'text-base';
    }
  };

  const renderContent = () => {
    if (src) {
      return (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials or icon if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      );
    }

    if (children) {
      return children;
    }

    if (fallback) {
      const initials = getInitials(fallback);
      return (
        <div 
          className={`${getBackgroundColor(initials)} ${getTextSize(size)} text-white font-semibold flex items-center justify-center w-full h-full`}
        >
          {initials}
        </div>
      );
    }

    return (
      <div className="bg-gray-200 text-gray-500 flex items-center justify-center w-full h-full">
        <User className={`${size === 'xs' ? 'h-4 w-4' : size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-12 w-12'}`} />
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      <div
        onClick={onClick}
        className={`
          ${sizeClasses[size]}
          ${shapeClasses[shape]}
          ${borderClass}
          ${className}
          overflow-hidden
          ${onClick ? 'cursor-pointer' : ''}
          flex items-center justify-center
          transition-all duration-200
          hover:opacity-90
        `}
      >
        {renderContent()}
      </div>
      
      {/* Status indicator */}
      {status && (
        <div 
          className={`
            absolute bottom-0 right-0
            ${statusColors[status]}
            ${statusSize[size]}
            rounded-full
            border-2 border-white
            ${shape === 'circle' ? 'transform translate-x-1/4 translate-y-1/4' : ''}
          `}
        />
      )}
    </div>
  );
};

// Avatar Group Component
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max,
  size = 'md',
  className = '',
}) => {
  const childrenArray = React.Children.toArray(children);
  const totalChildren = childrenArray.length;
  const maxChildren = max || totalChildren;
  const visibleChildren = childrenArray.slice(0, maxChildren);
  const extraCount = totalChildren - maxChildren;

  // Spacing based on size
  const spacing = {
    xs: '-space-x-2',
    sm: '-space-x-3',
    md: '-space-x-4',
    lg: '-space-x-5',
    xl: '-space-x-6',
  };

  return (
    <div className={`flex ${spacing[size]} ${className}`}>
      {visibleChildren.map((child, index) => (
        <div 
          key={index}
          className="inline-block ring-2 ring-white rounded-full"
        >
          {React.cloneElement(child as React.ReactElement, { 
            size,
            bordered: false 
          })}
        </div>
      ))}
      
      {extraCount > 0 && (
        <div className={`
          ${size === 'xs' ? 'h-8 w-8' : 
            size === 'sm' ? 'h-10 w-10' : 
            size === 'md' ? 'h-12 w-12' : 
            size === 'lg' ? 'h-16 w-16' : 
            'h-24 w-24'
          }
          bg-gray-200 text-gray-600
          rounded-full
          flex items-center justify-center
          text-sm font-medium
          ring-2 ring-white
        `}>
          +{extraCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;