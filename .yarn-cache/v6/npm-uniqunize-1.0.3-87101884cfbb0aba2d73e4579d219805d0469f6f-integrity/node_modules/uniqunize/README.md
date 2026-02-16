# uniqunize

Return unique items from an array, preserving order. Optionally provide a
projection callback to compare items by a derived value.

## Install

```bash
npm install uniqunize
```

## Usage

```js
import uniqunize from "uniqunize"

const numbers = [1, 1, 3, 5]
const uniqueNumbers = uniqunize(numbers)
// [1, 3, 5]

const tuples = [[2, 1], [1, 1], [3, 3], [1, 5]]
const uniqueBySecond = uniqunize(tuples, (value) => value[1])
// [[2, 1], [3, 3], [1, 5]]
```

## API

```ts
uniqunize<T, U>(array: T[], callback?: (value: T) => U): T[]
```

## Notes

- When no callback is provided, values are compared directly.
- When a callback is provided, its return value is used for uniqueness checks.
