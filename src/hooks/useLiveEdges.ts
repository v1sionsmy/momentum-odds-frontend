import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import type { Edge } from "@/types/edge";

const WS_ORIGIN = process.env.NEXT_PUBLIC_WS_ORIGIN ?? "ws://localhost:8000";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export const useLiveEdges = (gameId?: number) => {
  const qc = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    if (!gameId) return;

    setStatus("connecting");
    const ws = new WebSocket(`${WS_ORIGIN}/ws/edges/${gameId}`);

    ws.onopen = () => {
      console.log("[Edges] WebSocket connected");
      setStatus("connected");
    };

    ws.onclose = () => {
      console.log("[Edges] WebSocket disconnected");
      setStatus("disconnected");
    };

    ws.onerror = (error) => {
      console.error("[Edges] WebSocket error:", error);
      setStatus("error");
    };

    ws.onmessage = (e) => {
      try {
        const edge: Edge = JSON.parse(e.data);
        qc.setQueryData<Edge[]>(["edges", gameId], (old = []) => {
          const idx = old.findIndex((x) => x.edgeId === edge.edgeId);
          if (idx === -1) return [...old, edge];
          const copy = [...old];
          copy[idx] = edge;
          return copy;
        });
      } catch (err) {
        console.error("[Edges] Bad edge payload:", e.data);
      }
    };

    return () => {
      ws.close();
      setStatus("disconnected");
    };
  }, [gameId, qc]);

  const { data: edges = [], isLoading, error } = useQuery<Edge[]>({
    queryKey: ["edges", gameId],
    enabled: !!gameId,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 30000, // Fallback refetch every 30s
  });

  return {
    edges,
    status,
    isLoading,
    error,
  };
}; 