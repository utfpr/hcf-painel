export function isRedesignEnabled(): boolean {
  return import.meta.env.VITE_REDESIGN_ENABLED === 'true'
}
