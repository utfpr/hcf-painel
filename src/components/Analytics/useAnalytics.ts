import { useContext } from 'react';
import { AnalyticsContext } from './AnalyticsContext';


export function useAnalytics() {
  const analytics = useContext(AnalyticsContext);
  if (!analytics) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return {analytics};
}
