import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllOrders } from '../api/orderApi.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';

/**
 * Custom hook for real-time order notifications
 * Polls for new pending orders and triggers notifications
 */
export const useOrderNotifications = (options = {}) => {
  const {
    enabled = true,
    pollingInterval = 5000, // Poll every 5 seconds
    onNewOrder = null,
    userRole = null
  } = options;

  const [lastOrderId, setLastOrderId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const audioRef = useRef(null);

  // Initialize notification sound
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current = audioContext;

    return () => {
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!audioRef.current) return;

    try {
      const oscillator = audioRef.current.createOscillator();
      const gainNode = audioRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioRef.current.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioRef.current.currentTime + 0.5);

      oscillator.start(audioRef.current.currentTime);
      oscillator.stop(audioRef.current.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  // Check for new orders
  const checkForNewOrders = useCallback(async () => {
    if (!mountedRef.current || isPolling) return;

    try {
      setIsPolling(true);

      // Fetch latest orders (only first page with pending status)
      const response = await getAllOrders({ 
        page: 0, 
        size: 10,
        sort: 'orderDate,desc'
      });

      const orders = response?.content || response || [];
      
      // Filter pending orders
      const pendingOrders = orders.filter(order => order.status === ORDER_STATUS.PENDING);

      if (pendingOrders.length > 0) {
        const latestOrder = pendingOrders[0];

        // Check if this is a new order (different from last known order)
        if (lastOrderId !== null && latestOrder.id !== lastOrderId) {
          // New order detected!
          playNotificationSound();
          
          if (onNewOrder && typeof onNewOrder === 'function') {
            onNewOrder(latestOrder);
          }
        }

        // Update last known order ID
        if (latestOrder.id !== lastOrderId) {
          setLastOrderId(latestOrder.id);
        }
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    } finally {
      if (mountedRef.current) {
        setIsPolling(false);
      }
    }
  }, [lastOrderId, isPolling, onNewOrder, playNotificationSound]);

  // Start/stop polling based on enabled flag and user role
  useEffect(() => {
    mountedRef.current = true;

    // Only enable for Barista and Staff roles
    const shouldPoll = enabled && (
      userRole === 'BARISTA' || 
      userRole === 'Barista' ||
      userRole === 'STAFF' ||
      userRole === 'Staff' ||
      userRole === 'SERVICE_STAFF' ||
      userRole === 'Service Staff'
    );

    if (shouldPoll) {
      // Initial check
      checkForNewOrders();

      // Set up polling interval
      intervalRef.current = setInterval(() => {
        checkForNewOrders();
      }, pollingInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, pollingInterval, userRole, checkForNewOrders]);

  return {
    isPolling,
    lastOrderId,
    checkNow: checkForNewOrders
  };
};
