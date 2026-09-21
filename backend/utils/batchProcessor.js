/**
 * Splits an array into smaller chunks/batches.
 *
 * @param {Array} records - Array of records to chunk
 * @param {number} batchSize - Maximum items per batch (default 15 for optimal LLM context & reliability)
 * @returns {Array[]} Array of batches
 */
export const createBatches = (records, batchSize = 15) => {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  const batches = [];
  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }
  return batches;
};

/**
 * Executes an async task with automatic retry and exponential backoff.
 * Especially useful for LLM rate limits (HTTP 429) or transient network hiccups.
 *
 * @param {Function} taskFn - Async function returning a promise
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} initialDelayMs - Starting delay in ms
 * @returns {Promise<any>}
 */
export const withRetry = async (taskFn, maxRetries = 3, initialDelayMs = 1500) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await taskFn();
    } catch (error) {
      lastError = error;
      console.warn(`[Retry Attempt ${attempt}/${maxRetries}] Failed:`, error.message);

      if (attempt < maxRetries) {
        // If rate limit, wait longer (exponential backoff with jitter)
        const delay = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
        console.log(`Waiting ${Math.round(delay)}ms before retry...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
};
