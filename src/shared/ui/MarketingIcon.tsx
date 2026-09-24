import type { ReactNode } from 'react'

export type MarketingIconName =
  | 'api'
  | 'arrow'
  | 'brain'
  | 'building'
  | 'chart'
  | 'check'
  | 'clock'
  | 'close'
  | 'code'
  | 'copy'
  | 'eye'
  | 'key'
  | 'layers'
  | 'menu'
  | 'shield'
  | 'spark'
  | 'users'
  | 'wallet'
  | 'warning'

interface MarketingIconProps {
  name: MarketingIconName
  size?: number
}

export function MarketingIcon({ name, size = 22 }: MarketingIconProps) {
  const paths: Record<MarketingIconName, ReactNode> = {
    api: (
      <>
        <path d="M8 9 4 12l4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    brain: (
      <>
        <path d="M9.5 4.5A3 3 0 0 0 6 7.4 3.6 3.6 0 0 0 4 14a3.5 3.5 0 0 0 5.5 3.3" />
        <path d="M14.5 4.5A3 3 0 0 1 18 7.4a3.6 3.6 0 0 1 2 6.6 3.5 3.5 0 0 1-5.5 3.3" />
        <path d="M9.5 4.5v15M14.5 4.5v15M9.5 10H7.8M16.2 14h-1.7" />
      </>
    ),
    building: (
      <>
        <path d="M4 21h16M6 21V8l6-4 6 4v13" />
        <path d="M9 11h.01M15 11h.01M9 15h.01M15 15h.01M11 21v-3h2v3" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    code: (
      <>
        <path d="m9 8-4 4 4 4" />
        <path d="m15 8 4 4-4 4" />
      </>
    ),
    copy: (
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="15" r="4.5" />
        <path d="m11.5 11.5 8-8M17 5l2 2M14 8l2 2" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 4.5 6v5.2c0 4.7 3.2 8.2 7.5 9.8 4.3-1.6 7.5-5.1 7.5-9.8V6L12 3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.1 3.2L16 8l-2.9 1.8L12 13l-1.1-3.2L8 8l2.9-1.8L12 3Z" />
        <path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14ZM5 4v4M3 6h4" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2" />
        <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14a5 5 0 0 1 2.5 4.3V20" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
        <path d="M15 10h5v4h-5a2 2 0 0 1 0-4Z" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3 2.8 20h18.4z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  )
}
