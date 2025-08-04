export class FerryApiService {
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 2;

  static async callWithRetry<T>(
    apiCall: () => Promise<T>,
    operatorName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await Promise.race([
          apiCall(),
          this.timeoutPromise(this.TIMEOUT),
        ]);
      } catch (error) {
        lastError = error as Error;
        console.warn(`${operatorName} API attempt ${attempt} failed:`, error);

        // Don't retry on certain errors (like authentication failures)
        if (this.isNonRetryableError(lastError)) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError!;
  }

  private static isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("invalid credentials")
    );
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("API timeout")), ms)
    );
  }
}
