# npm-api-maker Typecheck JSDoc Fixes

Total: ~83 errors remaining (was ~166). Batches 1, 2, and 3 done.

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

## Batch 4: Style type mismatches (TS2322) — ~5 errors

Style values like `"100vh"`, `display: string`, responsive `base`/`lgUp`/`mdDown` props.

Files:
- [ ] `src/super-admin/layout/index.jsx` (7: `"100vh"`, `base`/`lgUp`/`mdDown`/`mdUp` on ViewStyle)
- [ ] `src/super-admin/layout/header/index.jsx` (3: `display: string`, `flexDirection: string`, etc.)

**Approach:** Use proper responsive style typing or cast responsive style objects.

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

## Batch 6: Wrong argument counts (TS2554) — 18 errors

Calling functions with wrong number of arguments (likely missing JSDoc `@param`).

Files:
- [ ] `src/bootstrap/card.jsx` (1)
- [ ] `src/inputs/input.jsx` (1)
- [ ] `src/inputs/money.jsx` (3)
- [ ] `src/super-admin/layout/header/index.jsx` (1)
- [ ] `src/table/filters/filter-form.jsx` (2)
- [ ] `src/table/settings/column-row.jsx` (1)
- [ ] `src/table/settings/index.jsx` (1)
- [ ] `src/table/table.jsx` (2)
- [ ] `src/table/worker-plugins-check-all-checkbox.jsx` (2)
- [ ] `src/use-input.js` (1)
- [ ] `src/use-router.jsx` (1)
- [ ] `src/with-api-maker.jsx` (1)

**Approach:** Fix JSDoc `@param` annotations on called functions or add overloads.

---

## Batch 7: Instance property access on class components (TS2339) — ~15 errors

Properties like `controller`, `panResponder`, `events`, `position` not declared on class.

Files:
- [ ] `src/draggable-sort/index.jsx` (7: `controller` x6, `panResponder`)
- [ ] `src/draggable-sort/item.jsx` (3: `events`, `panResponder`, `position`)
- [ ] `src/table/worker-plugins-checkbox.jsx` (4: `createLink`, `destroyLinks`, `linkFor`, `linkLoaded`)
- [ ] `src/table/table.jsx` (1: `current` on `typeof BaseModel`)
- [ ] `src/super-admin/index.jsx` (1: `id` on `BaseModel`)
- [ ] `src/super-admin/layout/no-access.jsx` (1: `userRoles` on `BaseModel`)

**Approach:** Add class field JSDoc declarations or `@typedef` augmentations.

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
