# @hortemo/semaphore

A tiny, promise-based FIFO semaphore for JavaScript/TypeScript. Use it to
coordinate asynchronous work by limiting how many tasks can run in parallel
while still serving waiters in the order they arrived.

## Why this semaphore?

- **Predictable fairness** – requests are granted strictly in FIFO order.
- **Simple API** – one class, one method. Await a permit, run your task, then
  call the returned `release()` function.
- **TypeScript ready** – ships with type definitions and works seamlessly in
  CommonJS and ESM projects.
- **Tiny footprint** – no dependencies and no surprises.

## Installation

```bash
npm install @hortemo/semaphore
```

## Quick start

```ts
import Semaphore from "@hortemo/semaphore";

const semaphore = new Semaphore(5); // allow five concurrent tasks

async function processItem(item: string): Promise<void> {
  const release = await semaphore.acquire();
  try {
    await doWork(item);
  } finally {
    release(); // always release, even if the work throws
  }
}

await Promise.all(items.map(processItem));
```

Each call to `acquire()` waits (if needed) for a permit and resolves with a
`release()` function. Calling `release()` returns the permit to the pool so the
next waiting task can continue.

## API reference

### `new Semaphore(permits: number)`

Creates a semaphore with the given number of **permits**. `permits` must be a
non-negative integer. Passing any other value throws an error.

### `semaphore.acquire(): Promise<Releaser>`

Asynchronously waits for a permit. The returned promise resolves with a
`Releaser` function. Call it once you are done with the permit. Extra calls to
the same `Releaser` are ignored, so it is safe to place it in a `finally`
block.

### `type Releaser = () => void`

The function returned by `acquire()`. Invoke it once to return the permit. You
do not need to `await` it.

## Good practices

- Always release permits in a `finally` block so errors do not starve the
  queue.
- Keep the work inside the critical section as short as possible. The semaphore
  does not impose timeouts.
- Prefer creating one shared `Semaphore` instance per resource you want to
  guard.

## Troubleshooting

- Seeing "`Semaphore: 'permits' must be a non-negative integer`"? Ensure the
  number you pass to the constructor is a whole number (e.g. `0`, `1`, `5`).
- If your tasks never finish, confirm that every code path calls the releaser.
