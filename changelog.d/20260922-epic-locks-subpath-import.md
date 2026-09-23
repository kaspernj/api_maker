Fixed the `epic-locks` imports in `can-can.js` and `table/table-settings.js` to import `ReadersWriterLock` from its own module (`epic-locks/build/readers-writer-lock.js`) instead of the package root.

`epic-locks` 1.0.8 removed the root barrel exports in a patch release, so fresh installs resolving `>= 1.0.6` to 1.0.8 break consumer builds with `export 'ReadersWriterLock' was not found in 'epic-locks'`. The subpath import works with both 1.0.7 and 1.0.8.
