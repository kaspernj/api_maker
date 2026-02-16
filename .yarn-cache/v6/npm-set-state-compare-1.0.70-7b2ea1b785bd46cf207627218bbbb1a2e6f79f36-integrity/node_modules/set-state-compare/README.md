# set-state-compare

Lightweight helpers for React state updates, shape-style state containers, and value comparison utilities.

## Install

```bash
npm install set-state-compare
```

## Exports

```js
import {
  anythingDifferent,
  arrayDifferent,
  arrayReferenceDifferent,
  isSimpleObject,
  referenceDifferent,
  simpleObjectDifferent,
  simpleObjectValuesDifferent,
  Shape,
  setState
} from "set-state-compare"
```

## State Helpers

### setState
Drop-in helper that only applies state updates when values actually change.

```js
import setState from "set-state-compare"

await setState(this, {count: 1})
```

### Shape
Class-based state container with batched rendering support.

```js
import {Shape} from "set-state-compare"

const shape = new Shape(component)
shape.set({count: 1}, () => {
  // called after render
})
```

Modes:
- `Shape.setMode("queuedForceUpdate")` uses `forceUpdate` with an after-paint queue.
- `Shape.setMode("setState")` uses `setState` on the component.

## ShapeComponent
Class-style component wrapper with hooks-friendly state helpers.
`setup()` runs before each render, so initialization in `setup()` is re-applied every render. It is also the recommended place to call hook-style helpers like `useState`/`useStates`.

```js
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"

class Counter extends ShapeComponent {
  render() {
    this.useState("count", 0)
    return React.createElement("div", null, String(this.state.count))
  }
}

export default shapeComponent(Counter)
```

### cache
Instance-level cache with dependency comparison.

```js
const style = this.cache("style", () => ({padding: 8}), [theme, size])
```

### cacheStatic
Class-level cache shared across instances.

```js
const config = this.cacheStatic("config", () => ({padding: 8}), [theme, size])
```

## useShape
Hook-style shape for function components.

```js
import useShape from "set-state-compare/build/use-shape.js"

function Example(props) {
  const shape = useShape(props)
  shape.useState("count", 0)
  return React.createElement("div", null, String(shape.state.count))
}
```

## Comparison Utilities

- `anythingDifferent` deep-compares arrays and simple objects.
- `referenceDifferent` uses reference comparison for objects/arrays and `Object.is` for primitives.
- `arrayReferenceDifferent` compares array lengths and each element with `referenceDifferent`.
- `simpleObjectDifferent` and `simpleObjectValuesDifferent` compare plain objects.
- `arrayDifferent` compares arrays by value.
- `isSimpleObject` checks for plain objects (ignores React internal objects).

## Tests

```bash
npm test
npm run typecheck
```
