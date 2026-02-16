# Installation

```js
import {callbacksHandler} from "on-location-changed/build/callbacks-handler"

callbacksHandler.connectReactRouterHistory(history)
```

# Usage

```jsx
import WithCustomPath from "on-location-changed/build/with-custom-path"
```

```jsx
<WithCustomPath path={somePath}>
  <App />
</WithCustomPath>
```

```jsx
<WithLocationPath>
  <App />
</WithLocationPath>
```

```jsx
import usePath from "on-location-changed/build/use-custom-path"
```

```jsx
const path = usePath()
```
