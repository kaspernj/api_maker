Fixed the `npm-api-maker` ESLint 10 upgrade so `npm install` no longer fails on the unresolved `eslint-plugin-react` peer range.

Updated the direct ESLint plugin dependencies that already support ESLint 10 and checked in a local npm peer-resolution workaround until the remaining upstream peer metadata catches up.

Also restored linked dummy-app builds and local lint/test resolution by installing peer-facing runtime packages in `npm-api-maker` development environments while keeping them as peer dependencies for package consumers where appropriate.
