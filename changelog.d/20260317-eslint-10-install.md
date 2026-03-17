Fixed the `npm-api-maker` ESLint 10 upgrade so `npm install` no longer fails on the unresolved `eslint-plugin-react` peer range.

Updated the direct ESLint plugin dependencies that already support ESLint 10 and checked in a local npm peer-resolution workaround until the remaining upstream peer metadata catches up.

Also restored linked dummy-app builds by installing `react-native-vector-icons` in `npm-api-maker` development environments while keeping it as a peer dependency for package consumers.
