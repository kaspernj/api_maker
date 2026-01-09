# Changelog

## Unreleased
- Add guards when loading table settings to surface missing data early.
- Accept React component types like `forwardRef` for `paginationComponent` to avoid prop-type warnings.
- Cache menu layout style and dataSet props inline with component usage.
- Cache filter form style props inline to avoid recreating objects each render.
- Cache static dataSet props across super admin, bootstrap, and table filter components.
- Allow inline cached style props in table without eslint `no-return-assign` errors.
- Remove `lastUpdate` from table dataSet cache keys to avoid unbounded growth.
- Restore filter button `data-class` for system spec selectors.
