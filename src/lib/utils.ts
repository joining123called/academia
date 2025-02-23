import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function formatUserRole(role: string): string {
  const roles = {
    admin: 'Administrator',
    writer: 'Writer',
    client: 'Client'
  };
  return roles[role as keyof typeof roles] || role;
}