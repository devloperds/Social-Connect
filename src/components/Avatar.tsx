import clsx from 'clsx'

interface AvatarProps {
  url?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ url, alt = 'User Avatar', size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={clsx('relative rounded-full overflow-hidden bg-gray-200 shrink-0', sizeClasses[size], className)}>
      {url ? (
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </div>
  )
}
