import { FaEnvelope, FaFolderOpen, FaUsersSlash } from 'react-icons/fa'

/**
 * Shared empty state for all pages.
 * variant: 'email' = no emails/items (FaEnvelope), 'data' = no data (FaFolderOpen), 'users' = no users (FaUsersSlash)
 */
export default function EmptyState({ variant = 'data', title, message, className = '', iconSize = 'w-20 h-20', children }) {
  const Icon = variant === 'email' ? FaEnvelope : variant === 'users' ? FaUsersSlash : FaFolderOpen
  const defaultTitle = variant === 'email' ? 'No emails' : variant === 'users' ? 'No users' : 'No data'
  const defaultMessage = variant === 'email' ? 'This folder is empty' : variant === 'users' ? 'No users in this role' : 'Nothing to show here yet'

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-gray-400 ${className}`}>
      <Icon className={`${iconSize} mb-4 opacity-50`} />
      <p className="text-gray-500 font-medium">{title ?? defaultTitle}</p>
      <p className="text-sm mt-1 text-gray-400">{message ?? defaultMessage}</p>
      {children}
    </div>
  )
}
