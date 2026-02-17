// @feature:code-display @domain:marketing @frontend @reusable
// @summary: Syntax-highlighted code block component for documentation

import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
}

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  className,
}: CodeBlockProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950',
        className
      )}
    >
      {filename && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {filename}
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code
            className={cn(
              'block font-mono',
              language === 'typescript' && 'text-gray-900 dark:text-gray-100',
              language === 'javascript' && 'text-gray-900 dark:text-gray-100',
              language === 'json' && 'text-gray-900 dark:text-gray-100'
            )}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
