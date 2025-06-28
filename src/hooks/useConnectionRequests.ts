import { useState, useEffect } from 'react';
import { connectionService } from '../services/connectionService';
import type { ConnectionRequest } from '../types/connections';

export function useConnectionRequests(userId: string | null) {
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setPendingRequests([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setLoading(false);
      return;
    }

    const loadRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const [incoming, outgoing] = await Promise.all([
          connectionService.getIncomingConnectionRequests(userId),
          connectionService.getOutgoingConnectionRequests(userId)
        ]);

        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
        setPendingRequests([...incoming, ...outgoing]);
      } catch (err) {
        console.error('Error loading connection requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load connection requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();

    // Refresh every 30 seconds to keep data current
    const interval = setInterval(loadRequests, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const refreshRequests = async () => {
    if (!userId) return;

    try {
      const [incoming, outgoing] = await Promise.all([
        connectionService.getIncomingConnectionRequests(userId),
        connectionService.getOutgoingConnectionRequests(userId)
      ]);

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setPendingRequests([...incoming, ...outgoing]);
    } catch (err) {
      console.error('Error refreshing connection requests:', err);
    }
  };

  return {
    pendingRequests,
    incomingRequests,
    outgoingRequests,
    pendingCount: incomingRequests.length,
    loading,
    error,
    refreshRequests
  };
}