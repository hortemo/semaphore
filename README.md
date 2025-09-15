# @hortemo/semaphore

A promise-based FIFO semaphore for JavaScript/TypeScript.

## Installation

```bash
npm install @hortemo/semaphore
```

## Quick start

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

## API reference

### `new Semaphore(permits: number)`

Creates a semaphore with the given number of **permits**.

### `semaphore.acquire(): Promise<Releaser>`

Asynchronously waits for a permit. The returned promise resolves with a
`Releaser` function. Call it once you are done with the permit. Extra calls to
the same `Releaser` are ignored.

### `type Releaser = () => void`

The function returned by `acquire()`. Invoke it to return the permit.
