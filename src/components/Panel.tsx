import type { HTMLAttributes, ReactNode } from 'react'

interface PanelProps extends HTMLAttributes<HTMLElement> {
  readonly as?: 'section' | 'aside'
  readonly children: ReactNode
}

export function Panel({
  as: Element = 'section',
  className = '',
  children,
  ...props
}: PanelProps) {
  return (
    <Element className={'panel' + (className ? ' ' + className : '')} {...props}>
      {children}
    </Element>
  )
}
