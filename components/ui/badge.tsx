import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger';
    children: React.ReactNode;
}

const variantClasses: Record<BadgeProps['variant'], string> = {
    default: 'bg-gray-500/20 border-gray-500/50 text-gray-300',
    primary: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    secondary: 'bg-pink-500/20 border-pink-500/50 text-pink-300',
    success: 'bg-green-500/20 border-green-500/50 text-green-300',
    danger: 'bg-red-500/20 border-red-500/50 text-red-300',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
                variantClasses[variant]
            )}
        >
            {children}
        </span>
    );
};
