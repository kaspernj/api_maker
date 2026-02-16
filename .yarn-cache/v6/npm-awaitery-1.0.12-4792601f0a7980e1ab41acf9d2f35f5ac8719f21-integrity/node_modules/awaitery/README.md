# Awaitery

## Usage

## retry

Retry a callback until it succeeds or you exhaust the configured tries (default 3); optionally wrap each attempt in a timeout and wait between failed attempts. Defaults to 3 tries with no timeout and no wait unless you pass options.

```js
import retry from "awaitery/src/retry.js"

await retry({tries: 3, wait: 1000, timeout: 4000}, async () => {
  const submitButton = await systemTest.findByTestID("signInButton")

  await systemTest.click(submitButton)
})

await retry(async () => {
  const submitButton = await systemTest.findByTestID("signInButton")

  await systemTest.click(submitButton)
})
```

## timeout

Run a callback with a hard timeout; if the timer wins, a `TimeoutError` is thrown, otherwise the callback’s return value is yielded. Defaults to a 5000ms timeout when called without options.

```js
import timeout from "awaitery/src/timeout.js"

await timeout({timeout: 4000}, async () => {
  const submitButton = await systemTest.findByTestID("signInButton")

  await systemTest.click(submitButton)
})

await timeout(async () => {
  const submitButton = await systemTest.findByTestID("signInButton")

  await systemTest.click(submitButton)
})
```

## wait

Sleep for the given milliseconds.

```js
import wait from "awaitery/src/wait.js"

await wait(1000)
```

## waitFor

Keep retrying a callback while it throws (or rejects) until it eventually succeeds or a timeout is reached; uses a small delay between attempts and rethrows the last error on timeout.
Options must be passed as the first argument when provided.

```js
import waitFor from "awaitery/src/wait-for.js"

await waitFor(async () => {
  if (await fileExists(targetPath)) throw new Error("Target file exists")
})

await waitFor({timeout: 2000, wait: 100}, async () => {
  if (await fileExists(targetPath)) throw new Error("Target file exists")
})
```
