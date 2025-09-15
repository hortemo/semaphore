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

- `new Semaphore(permits: number)`: Create a semaphore with `permits` available.
- `await semaphore.acquire()`: Wait for a permit and receive a `Releaser`. Call it to free the permit.
- `type Releaser = () => void`
