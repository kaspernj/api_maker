# flash-notifications

Flash notifications for React Native and Expo, with a lightweight container component and a simple API for triggering alerts.

## Installation

```
npm install flash-notifications
```

For managed Expo projects, ensure your Expo SDK supports this module and follow the Expo install guidance for modules. For bare React Native projects, install and configure the `expo` package before continuing.

## Setup

Render the notification container once near the root of your app.

```jsx
import React from "react"
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context"
import {Container} from "flash-notifications"

const NotificationsContainer = () => {
  const insets = useSafeAreaInsets()

  return <Container insets={insets} />
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationsContainer />
    </SafeAreaProvider>
  )
}
```

## Usage

Trigger notifications anywhere in your app with the static helpers.

```js
import {FlashNotifications} from "flash-notifications"

FlashNotifications.success("Saved successfully.")
FlashNotifications.error("Something went wrong.")
FlashNotifications.alert("Please check your input.")
```

If you need a custom type, you can use `show` directly.

```js
import {FlashNotifications} from "flash-notifications"

FlashNotifications.show({type: "info", text: "Heads up!"})
```

## Debug mode

Enable debug logging by setting the configuration flag at startup.

```js
import {configuration} from "flash-notifications"

configuration.debug = true
```

When enabled, the library logs lifecycle events such as notification creation, press, timeout, measurement, animation start/end, and removal, along with the notification ID.

## API documentation

- Latest stable release: https://docs.expo.dev/versions/latest/sdk/flash-notifications/
- Main branch: https://docs.expo.dev/versions/unversioned/sdk/flash-notifications/

## Contributing

Contributions are welcome. Please refer to the Expo contributing guide:
https://github.com/expo/expo#contributing
