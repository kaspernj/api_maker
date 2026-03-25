# npm-api-maker Typecheck JSDoc Fixes

Total: ~28 errors remaining (was ~166). Batches 1, 2, 3, 4, 5 (partial), 6, and 7 done.

## Error Categories

| Code | Description | Count |
|------|-------------|-------|
| TS2339 | Property does not exist on type | 60 |
| TS2322 | Type not assignable | 59 |
| TS2554 | Wrong number of arguments | 18 |
| TS2739 | Missing required properties | 6 |
| TS2307 | Cannot find module | 6 |
| TS2345 | Argument type not assignable | 5 |
| TS2304 | Cannot find name | 4 |
| TS2741 | Missing property in type | 3 |
| TS2353 | Unknown property in object literal | 2 |
| TS2732 | Cannot find JSON module | 1 |
| TS2532 | Object possibly undefined | 1 |
| TS2305 | Module has no exported member | 1 |

---

## Batch 1: `dataSet` prop on View/Pressable/Modal (TS2322) — DONE

Fixed by adding `src/react-native-augments.d.ts` with type augmentations for `dataSet` on `ViewProps`, `PressableProps`, `TextInputProps`, and `ModalProps`. Also added `className` on `ViewProps`. Resolved ~50 errors.

---

## Batch 2: `useStates` / state property access (TS2339) — DONE

Fixed by changing `this.state.X` to `this.s.X` (which is typed as `any`), adding JSDoc
`@type` casts for `this.setStates` access, adding `@param` type for default-destructured
method params, and adding `@type` annotations to untyped function component props.
Resolved ~19 errors. Also fixed duplicate `ModalProps` augmentation from Batch 1.

---

## Batch 3: `useInput` / input hook return type (TS2739/TS2339/TS2554) — DONE

Fixed by loosening `useInput` JSDoc `@param` types to `Record<string, any>` for `props`
and `wrapperOptions`, updating `@returns` to include `restProps`, and changing `this.form`
to `this.tt.form` in checkboxes components. Resolved ~14 errors.

---

## Batch 4: Style type mismatches (TS2322) — PARTIAL

Fixed `super-admin/layout/index.jsx` responsive styles (converted to plain typed object).
Remaining: `super-admin/layout/header/index.jsx` style string types (3 errors).

---

## Batch 5: Missing modules (TS2307/TS2732) — 7 errors

Cannot find module declarations.

Files:
- [ ] `src/models.js` — `model-recipes.json` (TS2732, needs `--resolveJsonModule`)
- [ ] `src/super-admin/models.js` — `models.js`
- [ ] `src/super-admin/layout/index.jsx` — `super-admin/config`
- [ ] `src/super-admin/edit-page/edit-attribute.jsx` — `shared/locales.js`
- [ ] `src/table/filters/index.jsx` — `models.js`
- [ ] `src/table/filters/load-search-modal.jsx` — `models.js`
- [ ] `src/table/settings/download-action.jsx` — `react-dom/server`

**Approach:** Add module declarations or path aliases in tsconfig/JSDoc.

---

## Batch 6: Wrong argument counts (TS2554) — DONE

Fixed by:
- Adding `undefined` initial value to `useRef()` calls (12 instances)
- Adding `undefined` default to `createContext()` calls (2 instances)
- Adding missing `[]` dependency array to `useCallback` (1 instance)
- Fixing `Object.keys(routes, ", ")` to `Object.keys(routes).join(", ")` (actual bug)
- Making `sendRequest` `args` param optional in JSDoc
- Adding `true` for required `checkLength` param in `simpleObjectDifferent`

Resolved all 18 errors.

---

## Batch 7: Instance properties, config methods, style types (TS2339) — DONE

Fixed all 34 TS2339 errors plus related TS2353/style errors by:
- Adding typed class field declarations for draggable-sort components
- Adding explicit method stubs for dynamic ApiMakerConfig accessors
- Changing `this.t(...)` to `this.tt.t(...)` in table and menu components
- Widening `modelClassRequire` and `useCurrentUser` return types
- Converting responsive StyleSheet.create to plain typed object
- Casting `import.meta.webpackContext` and `CurrentSwitchContext` default

Resolved ~37 errors.

---

## Batch 8: Miscellaneous — ~10 errors

- [ ] `src/api.js` (2) — header object type mismatch
- [ ] `src/link.jsx` (4) — `e` and `restArgs` cannot find name (TS2304)
- [ ] `src/inputs/money.jsx` (2) — `getCurrenciesCollection` on config, number/string mismatch
- [ ] `src/table/filters/load-search-modal.jsx` (1) — `getModal` on config
- [ ] `src/table/filters/save-search-modal.jsx` (1) — `getModal` on config
- [ ] `src/table/settings/column-row.jsx` (1) — `checked`/`indeterminate` HTML attr types
- [ ] `src/table/settings/download-action.jsx` (1) — argument type mismatch (`t` vs `l`)
- [ ] `src/table/header-select.jsx` (1) — missing `defaultParams` in argument
- [ ] `src/table/components/flat-list.jsx` (1) — missing `data`/`renderItem` props
- [ ] `src/utils/checkbox.jsx` (1) — `CheckBox` not exported from react-native (TS2305)
- [ ] `src/utils/default-style.jsx` (1) — missing `Text` property
- [ ] `src/utils/header.jsx` (1) — `style` not on state
- [ ] `src/utils/text.jsx` (1) — `style` not on state
- [ ] `src/use-updated-event.js` (1) — `Function` not assignable to callback type
- [ ] `src/with-collection.jsx` (1) — object possibly undefined
- [ ] `src/use-router.jsx` (2) — `getRouteDefinitions`/`getRoutes` on config
- [ ] `src/router/route.jsx` (2) — `pathsMatched`/`switchGroup` on `any[]`
- [ ] `src/router/switch.jsx` (1) — `pathShown` on `any[]`
- [ ] `src/routes-native.js` (3) — type mismatches in route building
- [ ] `src/super-admin/config-reader.jsx` (1) — `webpackContext` on `ImportMeta`

**Approach:** Fix individually per file.

---

## Suggested Order

1. **Batch 1** (dataSet augmentation) — single fix, biggest impact (~35 errors)
2. **Batch 2** (state typing) — moderate effort, ~20 errors
3. **Batch 3** (useInput typing) — focused fix, ~15 errors
4. **Batch 6** (argument counts) — scattered but straightforward, ~18 errors
5. **Batch 7** (class instance properties) — ~15 errors
6. **Batch 4** (style types) — ~5 errors
7. **Batch 5** (missing modules) — ~7 errors
8. **Batch 8** (miscellaneous) — ~10 errors remaining
