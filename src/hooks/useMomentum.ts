import { useEffect, useState } from "react";
import { getSnapshots, openSnapshotStream, type MomentumSnapshot } from "@/api/momentum";

export const useMomentum = (gameId: number) => {
  const [snapshots, setSnapshots] = useState<MomentumSnapshot[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let es: EventSource | null = null;

    const bootstrap = async () => {
      try {
        setIsLoading(true);
        // load initial history
        const initial = await getSnapshots(gameId, 50);
        setSnapshots(initial);

        // start SSE for live updates
        es = openSnapshotStream(gameId);
        es.onmessage = (e) => {
          const payload = JSON.parse(e.data) as MomentumSnapshot;
          setSnapshots((prev) => [...prev.slice(-49), payload]); // rolling 50
        };

        es.onerror = (e) => {
          console.error("SSE Error:", e);
          setError(new Error("Failed to connect to momentum stream"));
        };
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch momentum data"));
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      es?.close();
    };
  }, [gameId]);

  return { snapshots, error, isLoading };
}; 