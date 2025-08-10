/**
 * Clipboard utilities with fallbacks for environments where navigator.clipboard is unavailable
 */

/**
 * Check if the clipboard API is available
 */
export function isClipboardApiAvailable(): boolean {
  return typeof navigator !== 'undefined' && 
         'clipboard' in navigator && 
         typeof navigator.clipboard.writeText === 'function'
}

/**
 * Check if the clipboard write API is available (for images)
 */
export function isClipboardWriteAvailable(): boolean {
  return typeof navigator !== 'undefined' && 
         'clipboard' in navigator && 
         typeof navigator.clipboard.write === 'function'
}

/**
 * Fallback clipboard implementation using a temporary textarea
 */
function fallbackCopyText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      
      // Make the textarea invisible but still focusable
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      textArea.setAttribute('readonly', '')
      
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      // Try to use the older execCommand API
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        resolve()
      } else {
        reject(new Error('execCommand copy failed'))
      }
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Copy text to clipboard with fallback support
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (isClipboardApiAvailable()) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, trying fallback:', err)
      // Fall through to fallback
    }
  }
  
  // Use fallback method
  return fallbackCopyText(text)
}

/**
 * Copy image to clipboard (only works with modern clipboard API)
 */
export async function copyImageToClipboard(imageUrl: string): Promise<void> {
  if (!isClipboardWriteAvailable()) {
    throw new Error('Image copying not supported in this environment')
  }
  
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const clipboardItem = new ClipboardItem({ [blob.type]: blob })
    await navigator.clipboard.write([clipboardItem])
  } catch (err) {
    console.error('Failed to copy image:', err)
    throw new Error('Failed to copy image to clipboard')
  }
}

/**
 * Copy content to clipboard with automatic type detection and fallbacks
 */
export async function copyToClipboard(content: string, type: 'text' | 'image' | 'file', imageUrl?: string): Promise<void> {
  if (type === 'image' && imageUrl) {
    try {
      await copyImageToClipboard(imageUrl)
      return
    } catch (err) {
      console.warn('Image copy failed, falling back to text:', err)
      // Fall through to text copy as fallback
    }
  }
  
  // For text and file types, or as fallback for images
  await copyTextToClipboard(content)
}

/**
 * Get a user-friendly error message for clipboard failures
 */
export function getClipboardErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('not supported')) {
      return 'Clipboard access not supported in this browser or environment'
    }
    if (error.message.includes('permission')) {
      return 'Clipboard access denied. Please allow clipboard permissions in your browser settings'
    }
    if (error.message.includes('secure context')) {
      return 'Clipboard access requires a secure connection (HTTPS)'
    }
  }
  
  return 'Failed to copy to clipboard. You may need to copy manually'
}