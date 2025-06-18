export async function retryPrismaQuery(queryFn, maxRetries = 3, delay = 100) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;

      // Check if it's a prepared statement error
      if (
        error.message?.includes("prepared statement") ||
        error.code === "P2024" ||
        error.meta?.code === "42P05"
      ) {
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
          continue;
        }
      }

      // If it's not a retriable error or we've exhausted retries, throw
      throw error;
    }
  }

  throw lastError;
}
