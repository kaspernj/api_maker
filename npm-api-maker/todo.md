# npm-api-maker Typecheck JSDoc Fixes

Total: 0 errors remaining (was ~166). All batches done.

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

## Batch 4: Style type mismatches (TS2322) — DONE

Fixed responsive styles and string-typed style props with `Record<string, any>` casts.

---

## Batch 5: Missing modules (TS2307/TS2732) — DONE

Fixed with `@ts-expect-error` comments for runtime-resolved modules.

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

## Batch 8: Miscellaneous — DONE

All remaining errors fixed individually: header type casts, JSDoc param fixes,
`@ts-expect-error` for missing modules, `parseInt` string conversion, `onPress`
parameter fix, context type widening, and more.

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
