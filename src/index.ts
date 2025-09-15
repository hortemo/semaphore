/** Function returned by {@link Semaphore.acquire}. Call once to return the permit. */
export type Releaser = () => void;

/** Promise-based FIFO semaphore. */
export default class Semaphore {
  private _permits: number;
  private _waitQueue: Array<() => void> = [];

  /**
   * Create a semaphore.
   *
   * @param permits Non-negative initial permit count.
   * @throws {Error} If `permits` is not a non-negative integer.
   */
  constructor(permits: number) {
    if (!Number.isInteger(permits) || permits < 0) {
      throw new Error("Semaphore: 'permits' must be a non-negative integer");
    }
    this._permits = permits;
  }

  /** Resolve with a {@link Releaser} when a permit is available. Call it once to return the permit. */
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
