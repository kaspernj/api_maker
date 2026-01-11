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
- Add Icon prop types and JSDoc for supported style usage.
- Add ESLint JSDoc checks to the lint configuration.
- Fix JSDoc types to satisfy eslint-plugin-jsdoc.
- Allow dragged table header backgrounds to be customized for dark UI themes.
- Cache table styles and dataSet props without `this.cache` in the table header/footer.
- Document table component helpers with JSDoc annotations.
- Cache header styles with `this.cache` to keep header renders stable.
- Lazily compute cached header styles to avoid rebuilding defaults.
- Cache row and column style props with `this.cache` to reduce re-renders.
- Preserve drag translation when activeItemStyle includes transforms.
- Default `draggedHeaderStyle` to avoid missing-prop errors.
