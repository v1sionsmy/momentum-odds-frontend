"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type SubscriptionTier = 'free' | 'pro';

interface PaywallProps {
  children: React.ReactNode;
  tier: SubscriptionTier;
  className?: string;
}

export function Paywall({ children, tier, className }: PaywallProps) {
  const { user, upgradeToPro } = useAuth();
  const isSubscribed = user?.subscription?.type === tier && user?.subscription?.status === 'active';

  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative p-6 text-center">
        <Lock className="w-8 h-8 mx-auto mb-4 text-muted" />
        <h3 className="text-lg font-semibold mb-2">
          {tier === 'pro' ? 'Pro Feature' : 'Premium Feature'}
        </h3>
        <p className="text-muted mb-4">
          {tier === 'pro' 
            ? 'Upgrade to Pro to access advanced player prop edges and real-time analytics.'
            : 'Subscribe to access this feature and more.'}
        </p>
        <Button
          onClick={() => upgradeToPro()}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Upgrade to Pro
        </Button>
      </div>
    </Card>
  );
} 