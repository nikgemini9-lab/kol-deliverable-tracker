'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}
const TabsContext = React.createContext<TabsContextType>({ value: '', onValueChange: () => {} })

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = ({ defaultValue = '', value, onValueChange, className, ...props }: TabsProps) => {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const change = onValueChange ?? setInternal
  return (
    <TabsContext.Provider value={{ value: current, onValueChange: change }}>
      <div className={cn('', className)} {...props} />
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('inline-flex h-9 items-center rounded-lg bg-slate-100 p-1 text-slate-500', className)}
      {...props}
    />
  )
)
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>(
  ({ className, value, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    const active = ctx.value === value
    return (
      <button
        ref={ref}
        onClick={() => ctx.onValueChange(value)}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          className
        )}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, value, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    if (ctx.value !== value) return null
    return <div ref={ref} className={cn('mt-4', className)} {...props} />
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
