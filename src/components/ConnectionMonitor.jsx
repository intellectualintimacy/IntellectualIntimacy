import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, X } from 'lucide-react';

export default function ConnectionMonitor() {
  const [isOnline, setIsOnline] = useState(true); // Default to true to avoid false negatives
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [testInProgress, setTestInProgress] = useState(false);

  useEffect(() => {
    // Only set initial online status, don't immediately show banner
    setIsOnline(navigator.onLine);

    // Handle browser online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
      setIsDismissed(false);
      setConnectionQuality('good');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
      setShowBanner(true);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test connection quality on mount and periodically
    testConnectionQuality();
    const qualityTestInterval = setInterval(testConnectionQuality, 60000); // Test every 60 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityTestInterval);
    };
  }, []);

  const testConnectionQuality = async () => {
    // Don't test if already testing or if browser says we're offline
    if (testInProgress || !navigator.onLine) {
      if (!navigator.onLine) {
        setConnectionQuality('offline');
        if (!isDismissed) setShowBanner(true);
      }
      return;
    }

    setTestInProgress(true);

    try {
      const startTime = performance.now();
      
      // Ping your own Supabase endpoint or a reliable server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, 
        {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store'
        }
      );

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Categorize based on response time
      if (duration > 3000) {
        setConnectionQuality('very-slow');
        if (!isDismissed) setShowBanner(true);
      } else if (duration > 1500) {
        setConnectionQuality('slow');
        if (!isDismissed) setShowBanner(true);
      } else if (duration > 800) {
        setConnectionQuality('moderate');
        // Don't show banner for moderate, just indicate
      } else {
        setConnectionQuality('good');
        setShowBanner(false);
      }

      // If response failed but didn't throw, check status
      if (!response.ok && response.status >= 500) {
        setConnectionQuality('slow');
        if (!isDismissed) setShowBanner(true);
      }

    } catch (error) {
      // Connection test failed
      if (error.name === 'AbortError') {
        // Timeout - very slow connection
        setConnectionQuality('very-slow');
        if (!isDismissed) setShowBanner(true);
      } else if (navigator.onLine) {
        // Browser says online but fetch failed - slow connection
        setConnectionQuality('slow');
        if (!isDismissed) setShowBanner(true);
      } else {
        // Actually offline
        setConnectionQuality('offline');
        if (!isDismissed) setShowBanner(true);
      }
    } finally {
      setTestInProgress(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await testConnectionQuality();
    setTimeout(() => {
      setIsRetrying(false);
      if (connectionQuality === 'good' || connectionQuality === 'moderate') {
        window.location.reload();
      }
    }, 1000);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    // Store in sessionStorage to remember dismissal
    sessionStorage.setItem('connectionBannerDismissed', 'true');
  };

  const getQualityLabel = () => {
    switch (connectionQuality) {
      case 'offline': return 'Offline';
      case 'very-slow': return 'Very Slow';
      case 'slow': return 'Slow';
      case 'moderate': return 'Moderate';
      case 'good': return 'Good';
      default: return 'Checking...';
    }
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'offline': return 'text-red-700 dark:text-red-400';
      case 'very-slow': return 'text-red-700 dark:text-red-400';
      case 'slow': return 'text-orange-700 dark:text-orange-400';
      case 'moderate': return 'text-yellow-700 dark:text-yellow-400';
      case 'good': return 'text-green-700 dark:text-green-400';
      default: return 'text-stone-700 dark:text-stone-400';
    }
  };

  const shouldShowBanner = 
    showBanner && 
    !isDismissed && 
    (connectionQuality === 'offline' || 
     connectionQuality === 'very-slow' || 
     connectionQuality === 'slow');

  return (
    <>
      {/* Connection Status Banner */}
      <AnimatePresence>
        {shouldShowBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <div className={`${
              connectionQuality === 'offline'
                ? 'bg-red-50 dark:bg-red-950/90 border-b-2 border-red-200 dark:border-red-900'
                : connectionQuality === 'very-slow'
                ? 'bg-red-50 dark:bg-red-950/90 border-b-2 border-red-200 dark:border-red-900'
                : 'bg-orange-50 dark:bg-orange-950/90 border-b-2 border-orange-200 dark:border-orange-900'
            } backdrop-blur-xl`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-full ${
                      connectionQuality === 'offline'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {connectionQuality === 'offline' ? (
                        <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-light ${
                          connectionQuality === 'offline'
                            ? 'text-red-900 dark:text-red-200'
                            : 'text-orange-900 dark:text-orange-200'
                        }`} style={{ fontFamily: 'Crimson Pro, serif' }}>
                          {connectionQuality === 'offline'
                            ? 'No Internet Connection' 
                            : 'Slow Connection Detected'}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 ${
                          connectionQuality === 'offline'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                            : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                        }`}>
                          {getQualityLabel()}
                        </span>
                      </div>
                      <p className={`text-xs font-light ${
                        connectionQuality === 'offline'
                          ? 'text-red-800 dark:text-red-300'
                          : 'text-orange-800 dark:text-orange-300'
                      }`}>
                        {connectionQuality === 'offline'
                          ? 'Please check your internet connection. Content may not load properly.'
                          : 'Your connection is slower than usual. Pages may take longer to load.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOnline && connectionQuality !== 'offline' && (
                      <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className={`px-4 py-2 text-xs font-light transition-colors inline-flex items-center gap-2 ${
                          connectionQuality === 'very-slow'
                            ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white'
                            : 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                        {isRetrying ? 'Testing...' : 'Retry'}
                      </button>
                    )}
                    <button
                      onClick={handleDismiss}
                      className="p-2 hover:bg-opacity-80 transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Connection Indicator (only show if moderate or good) */}
      <AnimatePresence>
        {!shouldShowBanner && (connectionQuality === 'moderate' || connectionQuality === 'good') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <div className="feature-card p-3 flex items-center gap-2 shadow-lg">
              <Wifi className={`w-4 h-4 ${getQualityColor()}`} strokeWidth={1.5} />
              <span className={`text-xs font-light ${getQualityColor()}`}>
                {getQualityLabel()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}