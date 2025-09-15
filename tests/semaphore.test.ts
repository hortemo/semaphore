import { describe, it, expect } from "vitest";
import Semaphore from "../src";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Semaphore (minimal acquire/release)", () => {
  it("limits concurrency to the number of permits", async () => {
    const permits = 3;
    const sem = new Semaphore(permits);

    let concurrent = 0;
    let peak = 0;

    async function task() {
      const release = await sem.acquire();
      try {
        concurrent++;
        peak = Math.max(peak, concurrent);
        await sleep(20);
      } finally {
        concurrent--;
        release();
      }
    }

    await Promise.all(Array.from({ length: 30 }, task));
    expect(peak).toBeLessThanOrEqual(permits);
  });

  it("is FIFO when permits = 1", async () => {
    const sem = new Semaphore(1);
    const order: number[] = [];
    const n = 12;

    async function task(i: number) {
      const release = await sem.acquire();
      try {
        order.push(i);
        await sleep(5);
      } finally {
        release();
      }
    }

    await Promise.all(Array.from({ length: n }, (_, i) => task(i)));
    expect(order).toEqual([...Array(n).keys()]);
  });

  it("release() is idempotent (double release does not leak permits)", async () => {
    const sem = new Semaphore(1);

    let concurrent = 0;
    let peak = 0;

    // First task releases multiple times on purpose.
    const first = (async () => {
      const release = await sem.acquire();
      try {
        concurrent++;
        peak = Math.max(peak, concurrent);
        await sleep(10);
      } finally {
        concurrent--;
        release();
        release(); // extra
        release(); // extra
      }
    })();

    // Many queued tasks should still execute one at a time.
    const rest = Promise.all(
      Array.from({ length: 10 }, async () => {
        const release = await sem.acquire();
        try {
          concurrent++;
          peak = Math.max(peak, concurrent);
          await sleep(2);
        } finally {
          concurrent--;
          release();
        }
      })
    );

    await Promise.all([first, rest]);
    expect(peak).toBe(1); // would be >1 if extra releases leaked
  });

  it("many tasks complete without deadlock", async () => {
    const sem = new Semaphore(5);
    const n = 200;

    let running = 0;
    let completed = 0;

    await Promise.all(
      Array.from({ length: n }, async () => {
        const release = await sem.acquire();
        try {
          running++;
          await sleep(1);
        } finally {
          running--;
          release();
          completed++;
        }
      })
    );

    expect(running).toBe(0);
    expect(completed).toBe(n);
  });

  it("acquire resolves with a function and calling it returns void", async () => {
    const sem = new Semaphore(1);
    const releaser = await sem.acquire();
    const result = releaser(); // should be void / undefined
    expect(result).toBeUndefined();
  });
});
