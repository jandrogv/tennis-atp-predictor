export class RetryablePromiseCache {
  private readonly entries = new Map<string, Promise<unknown>>();

  get<T>(key: string, load: () => Promise<T>): Promise<T> {
    const cached = this.entries.get(key) as Promise<T> | undefined;
    if (cached) {
      return cached;
    }

    const pending = load().catch((error) => {
      if (this.entries.get(key) === pending) {
        this.entries.delete(key);
      }
      throw error;
    });
    this.entries.set(key, pending);
    return pending;
  }
}