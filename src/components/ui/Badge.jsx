import { clsx } from 'clsx'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  blue:    'bg-blue-100 text-blue-700',
  green:   'bg-green-100 text-green-700',
  red:     'bg-red-100 text-red-700',
  yellow:  'bg-yellow-100 text-yellow-700',
  purple:  'bg-purple-100 text-purple-700',
}

export default function Badge({ children, variant = 'default', className, style }) {
  return (
    <span className={clsx('badge', variants[variant], className)} style={style}>
      {children}
    </span>
  )
}
