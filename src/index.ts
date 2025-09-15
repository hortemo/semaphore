/**
 * A function returned by {@link Semaphore.acquire}. Call it once to return the
 * permit you previously acquired. Extra calls are ignored, making it safe to
 * place inside a `finally` block.
 */
export type Releaser = () => void;

/**
 * A minimal, dependency-free FIFO semaphore for JavaScript/TypeScript.
 *
 * Use a semaphore when you want to limit the number of concurrent operations
 * that touch a shared resource (for example, at most five simultaneous network
 * requests). {@link Semaphore.acquire} gives you a promise that resolves when a
 * permit becomes available and hands you back a {@link Releaser releaser}
 * function for returning it.
 *
 * Basic usage:
 * ```ts
 * const release = await semaphore.acquire();
 * try {
 *   await doWork();
 * } finally {
 *   release();
 * }
 * ```
 */
export default class Semaphore {
  private _permits: number;
  private _waitQueue: Array<() => void> = [];

  /**
   * Create a semaphore with the given number of permits.
   *
   * @param permits Initial number of permits. Must be a non-negative integer.
   * @throws {Error} If `permits` is not a whole number greater than or equal to
   * zero.
   */
  constructor(permits: number) {
    if (!Number.isInteger(permits) || permits < 0) {
      throw new Error("Semaphore: 'permits' must be a non-negative integer");
    }
    this._permits = permits;
  }

  /**
   * Wait for a permit and resolve with a {@link Releaser}.
   *
   * The returned promise settles as soon as the semaphore can grant a permit.
   * Once your work is complete, invoke the releaser exactly once to return the
   * permit to the pool so the next waiter can continue.
   */
  public acquire(): Promise<Releaser> {
    return new Promise<Releaser>((resolve) => {
      this._waitQueue.push(() => {
        let released = false;
        resolve(() => {
          if (released) return;
          released = true;
          this._permits++;
          this._dispatch();
        });
      });
      this._dispatch();
    });
  }

  /** Try to grant permits to the wait queue while any are available. */
  private _dispatch(): void {
    while (this._permits > 0 && this._waitQueue.length > 0) {
      this._permits--;
      this._waitQueue.shift()!();
    }
  }
}
