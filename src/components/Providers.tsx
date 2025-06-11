"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth/AuthContext";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // ✅ CRITICAL FIX: Enable experimental flag for Next.js 15 + React 19 compatibility
        experimental_prefetchInRender: true,
        
        // Much more conservative refetching to improve UX
        staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh longer
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        refetchOnWindowFocus: false, // Stop aggressive refetching on focus
        refetchOnMount: false, // Don't refetch on component mount if data exists
        refetchOnReconnect: true, // Still refetch when network reconnects
        retry: 1, // Reduce retry attempts
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        
        // ✅ Additional Next.js 15 optimizations
        networkMode: 'always', // Ensure queries work in SSR
        refetchOnWindowFocus: false, // Prevent aggressive refetching
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
} 