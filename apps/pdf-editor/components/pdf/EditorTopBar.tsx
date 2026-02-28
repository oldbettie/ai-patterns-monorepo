'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Top toolbar with tool selector and zoom controls

import { MousePointer2, Type, PenLine } from 'lucide-react'

export type ActiveTool = 'selector' | 'text' | 'signature'

export const MIN_SCALE = 0.25
export const MAX_SCALE = 3

interface EditorTopBarProps {
  activeTool: ActiveTool
  onToolChange: (tool: ActiveTool) => void
  scale: number
  onScaleChange: (scale: number) => void
}

export function EditorTopBar({ activeTool, onToolChange, scale, onScaleChange }: EditorTopBarProps) {
  return (
    <div className="flex items-center justify-between px-4 h-12 bg-background border-b border-border">
      {/* Left: Tool selector */}
      <div className="w-full flex items-center">
        <div className="flex items-center bg-accent rounded-lg p-1 gap-0.5">
          <button
            onClick={() => onToolChange('selector')}
            className={`w-8 h-7 flex items-center justify-center rounded transition-colors ${activeTool === 'selector' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Selector tool"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToolChange('text')}
            className={`w-8 h-7 flex items-center justify-center rounded transition-colors ${activeTool === 'text' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Text tool"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToolChange('signature')}
            className={`w-8 h-7 flex items-center justify-center rounded transition-colors ${activeTool === 'signature' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Signature tool"
          >
            <PenLine className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Zoom controls */}
      <div className="flex justify-center items-center gap-1">
        <button
          onClick={() => onScaleChange(Math.max(MIN_SCALE, scale - 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded text-sm bg-accent hover:bg-accent/80 transition-colors text-foreground"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => onScaleChange(1)}
          className="min-w-[3.5rem] text-center text-xs tabular-nums px-1.5 py-1 rounded bg-accent hover:bg-accent/80 transition-colors text-foreground"
          aria-label="Reset zoom"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={() => onScaleChange(Math.min(MAX_SCALE, scale + 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded text-sm bg-accent hover:bg-accent/80 transition-colors text-foreground"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  )
}
