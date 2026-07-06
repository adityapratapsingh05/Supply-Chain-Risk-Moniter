import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function riskColor(tier: string) {
  switch (tier) {
    case 'CRITICAL': return '#E5484D';
    case 'HIGH': return '#F5A623';
    case 'MEDIUM': return '#F5C518';
    default: return '#2ECC71';
  }
}
