/**
 * Retry Utilities with Exponential Backoff
 * Provides robust error handling for network operations
 */

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelayMs - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelayMs - Maximum delay in ms (default: 10000)
 * @param {number} options.backoffMultiplier - Delay multiplier (default: 2)
 * @param {Function} options.onRetry - Callback for retry events
 * @returns {Promise<any>} - Result from function
 * @throws {Error} - Last error after all retries exhausted
 */
async function retryWithBackoff(fn, options = {}) {
    const {
        maxRetries = 3,
        initialDelayMs = 1000,
        maxDelayMs = 10000,
        backoffMultiplier = 2,
        onRetry = null
    } = options;

    let lastError;
    let delay = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            if (isNonRetryableError(error)) {
                throw error;
            }

            // If this was the last attempt, throw
            if (attempt === maxRetries) {
                break;
            }

            // Call retry callback if provided
            if (onRetry) {
                onRetry(attempt + 1, maxRetries, delay, error);
            }

            // Wait before retrying
            await sleep(delay);

            // Increase delay with exponential backoff
            delay = Math.min(delay * backoffMultiplier, maxDelayMs);
        }
    }

    // All retries exhausted
    throw enrichError(lastError, maxRetries);
}

/**
 * Check if error should not be retried
 * @param {Error} error - Error to check
 * @returns {boolean} - True if error should not be retried
 */
function isNonRetryableError(error) {
    // HTTP 4xx errors (client errors) should not be retried
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        // Except for 429 (Too Many Requests) and 408 (Request Timeout)
        if (error.statusCode === 429 || error.statusCode === 408) {
            return false;
        }
        return true;
    }

    // Authentication errors should not be retried
    if (error.message && error.message.includes('401')) {
        return true;
    }

    // Invalid input errors should not be retried
    if (error.message && (
        error.message.includes('required') ||
        error.message.includes('invalid')
    )) {
        return true;
    }

    return false;
}

/**
 * Enrich error with retry information and helpful suggestions
 * @param {Error} error - Original error
 * @param {number} maxRetries - Number of retries attempted
 * @returns {Error} - Enriched error
 */
function enrichError(error, maxRetries) {
    const originalMessage = error.message || 'Unknown error';
    let suggestion = '';

    // Network errors
    if (error.code === 'ECONNREFUSED') {
        suggestion = 'Backend API is not running. Please check if the backend server is started on port 8000.';
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        suggestion = 'Request timed out. The backend may be overloaded or the operation is taking too long.';
    } else if (error.code === 'ENOTFOUND') {
        suggestion = 'Backend hostname could not be resolved. Please check the ABM2_API_URL configuration.';
    } else if (error.code === 'ECONNRESET') {
        suggestion = 'Connection was reset by the backend. This might indicate a server restart or network issue.';
    }
    // HTTP errors
    else if (error.statusCode === 401) {
        suggestion = 'Authentication failed. Please check ABM2_USERNAME and ABM2_PASSWORD in .env file.';
    } else if (error.statusCode === 404) {
        suggestion = 'API endpoint not found. The backend API may have changed or the endpoint is incorrect.';
    } else if (error.statusCode === 500) {
        suggestion = 'Backend internal error. Check the backend logs at /tmp/abm2-backend.log for details.';
    } else if (error.statusCode === 503) {
        suggestion = 'Backend service unavailable. It may be starting up or overloaded.';
    }

    const enrichedMessage = `${originalMessage}\n` +
        `Attempted ${maxRetries + 1} times before failing.` +
        (suggestion ? `\n\nSuggestion: ${suggestion}` : '');

    const enrichedError = new Error(enrichedMessage);
    enrichedError.originalError = error;
    enrichedError.code = error.code;
    enrichedError.statusCode = error.statusCode;

    return enrichedError;
}

/**
 * Create a retryable version of a function
 * @param {Function} fn - Function to make retryable
 * @param {Object} retryOptions - Retry options
 * @returns {Function} - Retryable function
 */
function makeRetryable(fn, retryOptions = {}) {
    return async function(...args) {
        return await retryWithBackoff(() => fn(...args), retryOptions);
    };
}

/**
 * Graceful degradation wrapper
 * Returns a default value instead of throwing if operation fails
 * @param {Function} fn - Async function to execute
 * @param {any} defaultValue - Value to return on failure
 * @param {Object} options - Options
 * @param {Function} options.onError - Callback for errors
 * @returns {Promise<any>} - Result or default value
 */
async function withGracefulDegradation(fn, defaultValue, options = {}) {
    const { onError = null } = options;

    try {
        return await fn();
    } catch (error) {
        if (onError) {
            onError(error);
        }
        return defaultValue;
    }
}

module.exports = {
    sleep,
    retryWithBackoff,
    isNonRetryableError,
    enrichError,
    makeRetryable,
    withGracefulDegradation
};
