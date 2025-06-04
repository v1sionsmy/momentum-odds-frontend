"use client";

import React, { useState } from 'react';
import { useLiveEdges } from "@/hooks/useLiveEdges";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Edge } from "@/types/edge";

const sortFn: Record<string, (a: Edge, b: Edge) => number> = {
  edgePct: (a, b) => b.edgePct - a.edgePct,
  timestamp: (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
};

export const EdgesPanel = ({ gameId }: { gameId?: number }) => {
  const { edges, isLoading } = useLiveEdges(gameId);
  const [sortKey, setSortKey] = useState<keyof typeof sortFn>("edgePct");

  if (!gameId) return null;

  if (isLoading && !edges.length) {
    return <Skeleton className="h-24 w-full rounded-2xl" />;
  }

  const sorted = [...edges].sort(sortFn[sortKey]);

  return (
    <div className="space-y-3 rounded-2xl bg-[--mo-surface] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Player Prop Edges</h3>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as keyof typeof sortFn)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edgePct">Biggest Edge</SelectItem>
            <SelectItem value="timestamp">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.map((e) => (
        <div
          key={e.edgeId}
          className={cn(
            "flex items-center justify-between rounded-xl border p-2",
            e.edgePct >= 0.3
              ? "animate-pulse border-[--mo-accent]"
              : "border-[--mo-line]"
          )}
        >
          <span>
            {e.playerName} — {e.market.toUpperCase()}
          </span>
          <span className="font-mono">
            {Math.round(e.edgePct * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}; 