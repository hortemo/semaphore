# @hortemo/semaphore

A minimal FIFO semaphore for JavaScript/TypeScript.

## Install

```bash
npm i @hortemo/semaphore
```

## Quick start

```ts
import Semaphore from "@hortemo/semaphore";

const semaphore = new Semaphore(5);

await Promise.all(items.map(async (item: string) => {
  const release = await semaphore.acquire();
  try {
    await process(item);
  } finally {
    release();
  }
}));
```

## API

### `new Semaphore(permits: number)`
Create a semaphore with an initial number of **permits**.

### `acquire(): Promise<Releaser>`
Waits for a permit and resolves with a `release()` function.
- `release()` is **idempotent** (extra calls are ignored).
