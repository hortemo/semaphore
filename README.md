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

## Usage

Semaphores are useful whenever a piece of code must run with a limited
concurrency level or with exclusive access to a shared resource. This library
implements a FIFO semaphore, so the oldest pending `acquire()` call is the next
one to receive a permit.

### Limit parallelism of async work

```ts
const semaphore = new Semaphore(3);

async function fetchWithLimit(url: string) {
  const release = await semaphore.acquire();
  try {
    const response = await fetch(url);
    return await response.json();
  } finally {
    release();
  }
}

const results = await Promise.all(urls.map(fetchWithLimit));
```

### Guard access to a critical section

```ts
const semaphore = new Semaphore(1);

async function withExclusiveAccess<T>(fn: () => Promise<T>): Promise<T> {
  const release = await semaphore.acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}

await withExclusiveAccess(() => connection.query("BEGIN"));
```

Keep the critical section as small as possible and always call `release()` in a
`finally` block. The releaser is idempotent, so extra calls are ignored.

## API

### `new Semaphore(permits: number)`
Create a semaphore with an initial number of **permits**.

### `acquire(): Promise<Releaser>`
Waits for a permit and resolves with a `release()` function.
- `release()` is **idempotent** (extra calls are ignored).
