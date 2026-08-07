import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'outline' | 'solid' | 'ghost'
  readonly children: ReactNode
}

export function Button({
  variant = 'outline',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={'button button--' + variant + (className ? ' ' + className : '')}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
