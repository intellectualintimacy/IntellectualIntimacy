// hooks/useConnectionAwareFetch.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data with connection awareness and timeout handling
 * 
 * @param {Function} fetchFunction - The async function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, retry, showSlowWarning, timedOut }
 */
export function useConnectionAwareFetch(fetchFunction, options = {}) {
  const {
    timeout = 15000, // 15 seconds default timeout
    slowWarningThreshold = 5000, // Show slow warning after 5 seconds
    retryOnFailure = true,
    maxRetries = 2,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTimedOut(false);
    setShowSlowWarning(false);

    // Timer for slow warning
    const slowWarningTimer = setTimeout(() => {
      setShowSlowWarning(true);
    }, slowWarningThreshold);

    // Timer for timeout
    const timeoutTimer = setTimeout(() => {
      setTimedOut(true);
      setLoading(false);
      setError(new Error('Request timed out. Please check your connection.'));
    }, timeout);

    try {
      const result = await fetchFunction();
      clearTimeout(slowWarningTimer);
      clearTimeout(timeoutTimer);
      
      setData(result);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      clearTimeout(slowWarningTimer);
      clearTimeout(timeoutTimer);
      
      console.error('Fetch error:', err);
      setError(err);

      // Auto-retry on failure if enabled
      if (retryOnFailure && retryCount < maxRetries) {
        console.log(`Retrying... Attempt ${retryCount + 1} of ${maxRetries}`);
        setRetryCount(prev => prev + 1);
        
        // Exponential backoff: wait longer between retries
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        setTimeout(() => {
          fetchData();
        }, backoffDelay);
      }
    } finally {
      setLoading(false);
      setShowSlowWarning(false);
    }
  }, [fetchFunction, timeout, slowWarningThreshold, retryOnFailure, maxRetries, retryCount]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const retry = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    retry,
    showSlowWarning,
    timedOut,
    retryCount
  };
}

/**
 * Hook to check if user is online
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to detect connection speed
 */
export function useConnectionSpeed() {
  const [connectionSpeed, setConnectionSpeed] = useState('unknown');
  const [effectiveType, setEffectiveType] = useState('4g');

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      const updateConnectionInfo = () => {
        if (connection) {
          setEffectiveType(connection.effectiveType || '4g');
          
          // Categorize connection
          const type = connection.effectiveType;
          if (type === 'slow-2g' || type === '2g') {
            setConnectionSpeed('slow');
          } else if (type === '3g') {
            setConnectionSpeed('moderate');
          } else {
            setConnectionSpeed('fast');
          }
        }
      };

      updateConnectionInfo();
      connection?.addEventListener('change', updateConnectionInfo);

      return () => {
        connection?.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  return { connectionSpeed, effectiveType };
}

// Example usage in a component:
/*
import { useConnectionAwareFetch } from './hooks/useConnectionAwareFetch';
import { supabase } from './lib/supabase';
import { LoadingState, ErrorState, EventCardSkeleton } from './components/LoadingStates';

function EventsList() {
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  };

  const { 
    data: events, 
    loading, 
    error, 
    retry, 
    showSlowWarning,
    timedOut 
  } = useConnectionAwareFetch(fetchEvents, {
    timeout: 20000, // 20 seconds
    slowWarningThreshold: 5000, // 5 seconds
    retryOnFailure: true,
    maxRetries: 3
  });

  if (loading) {
    return (
      <div>
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        {showSlowWarning && (
          <LoadingState 
            message="Loading events..." 
            showConnectionWarning={true}
          />
        )}
      </div>
    );
  }

  if (error || timedOut) {
    return (
      <ErrorState
        title={timedOut ? "Connection Timeout" : "Unable to Load Events"}
        message={timedOut 
          ? "The request took too long. Your connection might be slow."
          : "We're having trouble loading events. Please check your connection."
        }
        onRetry={retry}
      />
    );
  }

  if (!events || events.length === 0) {
    return <EmptyState title="No Events" message="No upcoming events at the moment." />;
  }

  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
*/