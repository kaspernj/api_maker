# env-sense

## Install

```bash
npm install env-sense
```

## Usage

```js
import envSense from "env-sense"

const {isBrowser, isNative, isServer} = envSense()
```

```jsx
import useEnvSense from "env-sense/src/use-env-sense.js"

export default () => {
  const {isBrowser, isNative, isServer} = useEnvSense()
}
```
