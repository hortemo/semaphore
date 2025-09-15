/**
 * A function returned by {@link Semaphore.acquire}. Call it once to return the
 * permit you previously acquired. Extra calls are ignored.
 */
export type Releaser = () => void;

/**
 * A promise-based FIFO semaphore.
 *
 * Basic usage:
 * ```ts
 * const semaphore = new Semaphore(5);
 *
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
   * @throws {Error} If `permits` is not a positive integer.
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
   * Once your work is complete, invoke the releaser to return the permit to
   * the pool so the next waiter can continue.
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
