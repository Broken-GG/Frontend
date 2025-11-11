/**
 * Logger utility with environment-aware logging
 * Only logs debug messages in development mode
 */

const isDevelopment = import.meta.env?.MODE === 'development' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

export const logger = {
  /**
   * Log debug information (only in development)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log informational messages
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args) => {
    console.warn(...args);
  },

  /**
   * Log errors (always shown)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log successful operations (only in development)
   */
  success: (message) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`);
    }
  },

  /**
   * Group logs together (only in development)
   */
  group: (label, callback) => {
    if (isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }
};

export default logger;
