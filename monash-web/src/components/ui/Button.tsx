import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({ size = 'md', className = '', ...props }: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const defaultColorClass = !className.includes('bg-') ? 'bg-blue-600 text-white hover:bg-blue-700' : ''

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${defaultColorClass} ${className}`}
      {...props}
    />
  )
}
