import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, X } from 'lucide-react';

export default function ConnectionMonitor() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState('unknown');
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check connection status
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
      setIsDismissed(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection speed using Network Information API
    if ('connection' in navigator) {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      const updateConnectionSpeed = () => {
        if (connection) {
          const effectiveType = connection.effectiveType; // 'slow-2g', '2g', '3g', '4g'
          setConnectionSpeed(effectiveType);

          // Show banner for slow connections
          if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            setShowBanner(true);
          } else if (effectiveType === '3g') {
            setShowBanner(true);
          }
        }
      };

      updateConnectionSpeed();
      connection.addEventListener('change', updateConnectionSpeed);

      return () => {
        connection.removeEventListener('change', updateConnectionSpeed);
      };
    }

    // Fallback: Test connection speed by fetching a small resource
    testConnectionSpeed();
    const speedTestInterval = setInterval(testConnectionSpeed, 30000); // every 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(speedTestInterval);
    };
  }, []);

  const testConnectionSpeed = async () => {
    if (!navigator.onLine) return;

    try {
      const startTime = Date.now();
      const response = await fetch(
        'https://www.google.com/favicon.ico?v=' + Date.now(),
        { method: 'HEAD', cache: 'no-cache' }
      );
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration > 2000) {
        setConnectionSpeed('slow-2g');
        if (!isDismissed) setShowBanner(true);
      } else if (duration > 1000) {
        setConnectionSpeed('2g');
        if (!isDismissed) setShowBanner(true);
      } else if (duration > 500) {
        setConnectionSpeed('3g');
      } else {
        setConnectionSpeed('4g');
        setShowBanner(false);
      }
    } catch (error) {
      setConnectionSpeed('offline');
      if (!isDismissed) setShowBanner(true);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await testConnectionSpeed();
    setTimeout(() => {
      setIsRetrying(false);
      window.location.reload();
    }, 1000);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
  };

  const getSpeedLabel = () => {
    switch (connectionSpeed) {
      case 'slow-2g':
        return 'Very Slow';
      case '2g':
        return 'Slow';
      case '3g':
        return 'Moderate';
      case '4g':
        return 'Good';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getSpeedColor = () => {
    switch (connectionSpeed) {
      case 'slow-2g':
        return 'text-red-700 dark:text-red-400';
      case '2g':
        return 'text-orange-700 dark:text-orange-400';
      case '3g':
        return 'text-yellow-700 dark:text-yellow-400';
      case '4g':
        return 'text-green-700 dark:text-green-400';
      case 'offline':
        return 'text-red-700 dark:text-red-400';
      default:
        return 'text-stone-700 dark:text-stone-400';
    }
  };

  const shouldShowBanner =
    !isOnline ||
    (showBanner &&
      !isDismissed &&
      (connectionSpeed === 'slow-2g' ||
        connectionSpeed === '2g' ||
        connectionSpeed === '3g' ||
        connectionSpeed === 'offline'));

  return (
    <>
      {/* Connection Status Banner */}
      <AnimatePresence>
        {shouldShowBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <div
              className={`${
                !isOnline || connectionSpeed === 'offline'
                  ? 'bg-red-50 dark:bg-red-950/90 border-b-2 border-red-200 dark:border-red-900'
                  : connectionSpeed === 'slow-2g' || connectionSpeed === '2g'
                  ? 'bg-orange-50 dark:bg-orange-950/90 border-b-2 border-orange-200 dark:border-orange-900'
                  : 'bg-yellow-50 dark:bg-yellow-950/90 border-b-2 border-yellow-200 dark:border-yellow-900'
              } backdrop-blur-xl`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        !isOnline || connectionSpeed === 'offline'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : connectionSpeed === 'slow-2g' ||
                            connectionSpeed === '2g'
                          ? 'bg-orange-100 dark:bg-orange-900/30'
                          : 'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}
                    >
                      {!isOnline || connectionSpeed === 'offline' ? (
                        <WifiOff
                          className="w-5 h-5 text-red-600 dark:text-red-400"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <AlertTriangle
                          className="w-5 h-5 text-orange-600 dark:text-orange-400"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-sm font-medium ${
                            !isOnline || connectionSpeed === 'offline'
                              ? 'text-red-900 dark:text-red-200'
                              : connectionSpeed === 'slow-2g' ||
                                connectionSpeed === '2g'
                              ? 'text-orange-900 dark:text-orange-200'
                              : 'text-yellow-900 dark:text-yellow-200'
                          }`}
                          style={{ fontFamily: 'Crimson Pro, serif' }}
                        >
                          {!isOnline || connectionSpeed === 'offline'
                            ? 'No Internet Connection'
                            : 'Slow Internet Connection Detected'}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            !isOnline || connectionSpeed === 'offline'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                              : connectionSpeed === 'slow-2g' ||
                                connectionSpeed === '2g'
                              ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                          }`}
                        >
                          {getSpeedLabel()}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-light ${
                          !isOnline || connectionSpeed === 'offline'
                            ? 'text-red-800 dark:text-red-300'
                            : connectionSpeed === 'slow-2g' ||
                              connectionSpeed === '2g'
                            ? 'text-orange-800 dark:text-orange-300'
                            : 'text-yellow-800 dark:text-yellow-300'
                        }`}
                      >
                        {!isOnline || connectionSpeed === 'offline'
                          ? 'Please check your internet connection. Some features may not be available.'
                          : 'Your connection is slower than usual. Pages and content may take longer to load.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOnline && connectionSpeed !== 'offline' && (
                      <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className={`px-4 py-2 rounded text-xs font-light transition-colors inline-flex items-center gap-2 ${
                          connectionSpeed === 'slow-2g' ||
                          connectionSpeed === '2g'
                            ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white'
                            : 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            isRetrying ? 'animate-spin' : ''
                          }`}
                          strokeWidth={1.5}
                        />
                        {isRetrying ? 'Testing...' : 'Retry'}
                      </button>
                    )}
                    <button
                      onClick={handleDismiss}
                      className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
                        !isOnline || connectionSpeed === 'offline'
                          ? 'hover:bg-red-200 dark:hover:bg-red-900/50'
                          : connectionSpeed === 'slow-2g' ||
                            connectionSpeed === '2g'
                          ? 'hover:bg-orange-200 dark:hover:bg-orange-900/50'
                          : 'hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                      }`}
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

      {/* Floating Connection Indicator (bottom right) */}
      <AnimatePresence>
        {!shouldShowBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <div className="feature-card p-3 flex items-center gap-2 shadow-lg">
              <Wifi
                className={`w-4 h-4 ${getSpeedColor()}`}
                strokeWidth={1.5}
              />
              <span className={`text-xs font-light ${getSpeedColor()}`}>
                {getSpeedLabel()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
