import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-border bg-surface2 px-4 text-sm text-ink placeholder:text-muted focus-ring',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export function Badge({ tier }: { tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) {
  const styles: Record<string, string> = {
    LOW: 'bg-risk-low/15 text-risk-low',
    MEDIUM: 'bg-risk-medium/15 text-risk-medium',
    HIGH: 'bg-risk-high/15 text-risk-high',
    CRITICAL: 'bg-risk-critical/15 text-risk-critical',
  };
  return <span className={cn('rounded-full px-3 py-1 text-xs font-mono font-medium', styles[tier])}>{tier}</span>;
}
