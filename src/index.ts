/**
 * A minimal FIFO semaphore for JS/TS.
 *
 * Terminology:
 * - permit: a unit of capacity the semaphore controls
 * - acquire: wait until a permit is granted
 * - release: return a previously acquired permit
 * - wait queue: FIFO queue of pending acquires
 *
 * Usage:
 * const release = await sem.acquire();
 * try {
 *   // critical section
 * } finally {
 *   release();
 * }
 */
export type Releaser = () => void;

export default class Semaphore {
  private _permits: number;
  private _waitQueue: Array<() => void> = [];

  /**
   * @param permits Initial number of permits (non-negative integer).
   */
  constructor(permits: number) {
    if (!Number.isInteger(permits) || permits < 0) {
      throw new Error("Semaphore: 'permits' must be a non-negative integer");
    }
    this._permits = permits;
  }

  /**
   * Acquire one permit.
   * Resolves with a one-shot `release()` function. Extra calls to `release()` are ignored.
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
