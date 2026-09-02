import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MarketsScreen } from './src/screens/MarketsScreen';
import { useMemo } from 'react';

export default function FederatedCryptoApp() {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <MarketsScreen />
    </QueryClientProvider>
  );
}
