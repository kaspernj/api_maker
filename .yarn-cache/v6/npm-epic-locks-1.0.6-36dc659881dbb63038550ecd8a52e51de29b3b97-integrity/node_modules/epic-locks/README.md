# epic-locks

A project meant to contain multiple different type of mutex locks.

## Usage

### ReadersWriterLock

1. Multiple readers
2. Single writer
3. Prioritises reads
4. Processes queued jobs at the end of the event queue to let the original callers finish work before the lock processes the next queued item
5. Queues reads while writing

#### Initialize
```js
import {ReadersWriterLock} from "epic-locks"
const lock = new ReadersWriterLock()
```

#### Reading
```js
lock.read(() => {
  console.log("Reading!")
})
```

#### Writing
```js
lock.write(() => {
  console.log("Writing!")
})
```

#### Advanced
```js
import {ReadersWriterLock} from "epic-locks"
const lock = new ReadersWriterLock()
const promises = []
const result = []

promises.push(
  lock.read(async () => {
    await awaitTimeout(50)
    result.push(3)
  })
)
promises.push(
  lock.write(async () => {
    await awaitTimeout(10)

    lock.read(async () => {
      result.push(5)
    })

    result.push(4)
  })
)
promises.push(
  lock.read(async () => {
    await awaitTimeout(40)
    result.push(2)
  })
)
promises.push(
  lock.write(async () => {
    await awaitTimeout(20)
    result.push(6)
  })
)
promises.push(
  lock.read(async () => {
    await awaitTimeout(30)
    result.push(1)
  })
)

await Promise.all(promises)

expect(result).toEqual([1, 2, 3, 4, 5, 6])
```
