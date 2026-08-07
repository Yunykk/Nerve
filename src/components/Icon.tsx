import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'now'
  | 'timeline'
  | 'clock'
  | 'projects'
  | 'project'
  | 'world'
  | 'surfaces'
  | 'search'
  | 'settings'
  | 'chevron'
  | 'list'
  | 'tag'
  | 'phone'
  | 'laptop'
  | 'user'
  | 'users'
  | 'inbox'
  | 'pause'
  | 'finish'
  | 'focus'
  | 'cursor'
  | 'vscode'
  | 'safari'
  | 'plus'
  | 'goal'
  | 'link'
  | 'stop'
  | 'arrow'

interface IconProps extends SVGProps<SVGSVGElement> {
  readonly name: IconName
}

export function Icon({ name, ...props }: IconProps) {
  const paths: Record<IconName, ReactNode> = {
    home: (
      <path d="M3.5 10.2 12 3.4l8.5 6.8v9.1a1.7 1.7 0 0 1-1.7 1.7h-4.5v-7h-4.6v7H5.2a1.7 1.7 0 0 1-1.7-1.7Z" />
    ),
    now: (
      <path d="M3.5 10.2 12 3.4l8.5 6.8v9.1a1.7 1.7 0 0 1-1.7 1.7h-4.5v-7h-4.6v7H5.2a1.7 1.7 0 0 1-1.7-1.7Z" />
    ),
    timeline: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6.5V12l3.6 2.1" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6.5V12l3.6 2.1" />
      </>
    ),
    projects: (
      <path d="M3 7.2h7l1.8 2H21v9.4a1.9 1.9 0 0 1-1.9 1.9H4.9A1.9 1.9 0 0 1 3 18.6Zm0 0V5.4a1.9 1.9 0 0 1 1.9-1.9h5.3l1.7 2H19a2 2 0 0 1 2 2v1.7" />
    ),
    project: (
      <path d="M3 7.2h7l1.8 2H21v9.4a1.9 1.9 0 0 1-1.9 1.9H4.9A1.9 1.9 0 0 1 3 18.6Zm0 0V5.4a1.9 1.9 0 0 1 1.9-1.9h5.3l1.7 2H19a2 2 0 0 1 2 2v1.7" />
    ),
    world: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.35 2.5 3.5 5.5 3.5 9s-1.15 6.5-3.5 9c-2.35-2.5-3.5-5.5-3.5-9S9.65 5.5 12 3Z" />
      </>
    ),
    surfaces: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.2" />
        <rect x="14" y="3" width="7" height="7" rx="1.2" />
        <rect x="3" y="14" width="7" height="7" rx="1.2" />
        <rect x="14" y="14" width="7" height="7" rx="1.2" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.8" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06-2.96 2.96-.06-.06A1.6 1.6 0 0 0 15 19.4a1.6 1.6 0 0 0-.96 1.46V21H9.96v-.14A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.76.32l-.06.06-2.96-2.96.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.46-.96H3V9.96h.14A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.32-1.76l-.06-.06 2.96-2.96.06.06A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 .96-1.46V3h4.08v.14A1.6 1.6 0 0 0 15 4.6a1.6 1.6 0 0 0 1.76-.32l.06-.06 2.96 2.96-.06.06A1.6 1.6 0 0 0 19.4 9c.16.58.68.96 1.46.96H21v4.08h-.14c-.78 0-1.3.38-1.46.96Z" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    list: (
      <>
        <path d="M9 6h12M9 12h12M9 18h12" />
        <circle cx="4" cy="6" r=".7" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r=".7" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r=".7" fill="currentColor" stroke="none" />
      </>
    ),
    tag: <path d="M20.4 13.4 13.5 20.3 3.2 10V3.3h6.7ZM7.2 7.2h.01" />,
    phone: (
      <>
        <rect x="7.2" y="2.5" width="9.6" height="19" rx="1.7" />
        <path d="M10.2 5h3.6M11.3 18.8h1.4" />
      </>
    ),
    laptop: (
      <>
        <rect x="4.2" y="4.5" width="15.6" height="11.8" rx="1.2" />
        <path d="M2.3 19.5h19.4l-1.8-3.2H4.1Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7.4" r="3.8" />
        <path d="M5.2 21v-2.2a6.8 6.8 0 0 1 13.6 0V21" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20v-1.8a5.5 5.5 0 0 1 11 0V20M15.5 5.2a3.2 3.2 0 0 1 0 6.2M17 14a5.4 5.4 0 0 1 3.5 5v1" />
      </>
    ),
    inbox: (
      <>
        <path d="M4.6 5.2h14.8L22 15.4v3.2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3.2Z" />
        <path d="M2.2 15.4h5.2l1.3 2.2h6.6l1.3-2.2h5.2" />
      </>
    ),
    pause: (
      <>
        <path d="M8.5 5v14M15.5 5v14" />
      </>
    ),
    finish: <rect x="6.5" y="6.5" width="11" height="11" rx="1.1" fill="currentColor" stroke="none" />,
    focus: (
      <>
        <circle cx="12" cy="12" r="6.7" strokeDasharray="3 2.4" />
        <path d="M12 2.8v2M21.2 12h-2M12 21.2v-2M2.8 12h2" />
      </>
    ),
    cursor: (
      <>
        <rect x="1.8" y="1.8" width="20.4" height="20.4" rx="4.3" fill="currentColor" stroke="none" />
        <path d="m12 5.4 5.7 3.3v6.6L12 18.6l-5.7-3.3V8.7Zm0 0v6.5m5.7-3.2L12 11.9 6.3 8.7M12 18.6v-6.7" stroke="#fff" strokeWidth="1.15" />
      </>
    ),
    vscode: (
      <path d="m18.6 3.2-8.1 7.2-4.2-3.2-2.2 1.1v7.4l2.2 1.1 4.2-3.2 8.1 7.2 2.4-1.2V4.4ZM10.5 10.4v3.2l-4.2 2.1V8.3Zm7.1-3.6v10.4l-5.2-5.2Z" fill="currentColor" stroke="none" />
    ),
    safari: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.8 7.3-2.2 6.3-6.3 2.2 2.2-6.3Z" />
        <circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    plus: <path d="M12 4v16M4 12h16" />,
    goal: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="m15 9 5-5M17 4h3v3" />
      </>
    ),
    link: (
      <>
        <path d="m9.6 14.4-2 2a3.3 3.3 0 0 1-4.7-4.7l3-3a3.3 3.3 0 0 1 4.7 0" />
        <path d="m14.4 9.6 2-2a3.3 3.3 0 0 1 4.7 4.7l-3 3a3.3 3.3 0 0 1-4.7 0M8.5 12h7" />
      </>
    ),
    stop: <rect x="6" y="6" width="12" height="12" rx="1" />,
    arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
