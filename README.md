# @hortemo/semaphore

Promise-based FIFO semaphore for JavaScript and TypeScript.

## Install

```bash
npm install @hortemo/semaphore
```

## Use

```ts
import Semaphore from "@hortemo/semaphore";

const semaphore = new Semaphore(5);

async function processItem(item: string): Promise<void> {
  const release = await semaphore.acquire();
  try {
    await doWork(item);
  } finally {
    release();
  }
}

await Promise.all(items.map(processItem));
```

## API

- `new Semaphore(permits: number)`: create a semaphore with `permits` available. `permits` must be a non-negative integer.
- `await semaphore.acquire()`: wait for a permit and receive a `Releaser`. Call it once to free the permit.
- `type Releaser = () => void`: invoke to return the permit.
