// content.js - Content script for tracking page visibility

(function () {
    'use strict';

    let isVisible = !document.hidden;
    let heartbeatInterval = null;
    const HEARTBEAT_FREQUENCY = 5000; // 5 seconds
    const HEARTBEAT_INCREMENT = 5; // seconds to add per heartbeat

    // Get current page URL
    function getCurrentUrl() {
        return window.location.href;
    }

    // Send heartbeat to background script
    function sendHeartbeat() {
        if (isVisible) {
            chrome.runtime.sendMessage({
                type: 'heartbeat',
                visible: true,
                url: getCurrentUrl(),
                seconds: HEARTBEAT_INCREMENT
            }).catch(err => {
                // Background script might not be ready, ignore error
                console.debug('Heartbeat failed:', err);
            });
        }
    }

    // Handle visibility changes
    function handleVisibilityChange() {
        isVisible = !document.hidden;

        if (isVisible) {
            console.debug('Page became visible, starting heartbeat');
            startHeartbeat();
        } else {
            console.debug('Page hidden, stopping heartbeat');
            stopHeartbeat();
        }
    }

    // Start sending heartbeats
    function startHeartbeat() {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
        }

        // Send immediate heartbeat
        sendHeartbeat();

        // Start periodic heartbeats
        heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_FREQUENCY);
    }

    // Stop sending heartbeats
    function stopHeartbeat() {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    }

    // Handle page focus/blur
    function handleFocus() {
        isVisible = true;
        startHeartbeat();
    }

    function handleBlur() {
        isVisible = false;
        stopHeartbeat();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for window focus/blur events (additional tracking)
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Handle page unload - send final heartbeat
    window.addEventListener('beforeunload', () => {
        stopHeartbeat();
        // Send one final heartbeat before leaving
        if (isVisible) {
            sendHeartbeat();
        }
    });

    // Initialize - start heartbeat if page is visible
    if (isVisible) {
        console.debug('Content script loaded, page is visible');
        startHeartbeat();
    } else {
        console.debug('Content script loaded, page is hidden');
    }

    // Cleanup on script unload
    window.addEventListener('unload', () => {
        stopHeartbeat();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
    });

    console.debug('Pet Tracker content script initialized for:', getCurrentUrl());
})();