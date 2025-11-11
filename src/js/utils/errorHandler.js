/**
 * Centralized error handling utilities
 */

import logger from '@/js/utils/logger.js';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * API Error class for network/API failures
 */
export class ApiError extends AppError {
  constructor(message, statusCode = 500) {
    super(message, statusCode);
    this.name = 'ApiError';
  }
}

/**
 * Display error message to user
 */
export function showError(message, elementId = 'errorMessage') {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

/**
 * Hide error message
 */
export function hideError(elementId = 'errorMessage') {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

/**
 * Global error handler
 */
export function handleError(error, userMessage = 'Something went wrong. Please try again.') {
  logger.error('Error occurred:', error);

  // Determine user-friendly message
  let displayMessage = userMessage;
  
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      displayMessage = 'Summoner not found. Please check the name and tag.';
    } else if (error.statusCode === 429) {
      displayMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.statusCode >= 500) {
      displayMessage = 'Server error. Please try again later.';
    }
  } else if (error instanceof AppError) {
    displayMessage = error.message;
  } else if (error.message) {
    // Check for network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      displayMessage = 'Network error. Please check your connection.';
    }
  }

  showError(displayMessage);
  return displayMessage;
}

/**
 * Async function wrapper with error handling
 */
export function withErrorHandling(fn, errorMessage) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, errorMessage);
      throw error;
    }
  };
}

export default {
  AppError,
  ApiError,
  showError,
  hideError,
  handleError,
  withErrorHandling
};
