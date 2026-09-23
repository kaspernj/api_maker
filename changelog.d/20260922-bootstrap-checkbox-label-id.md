Fixed `bootstrap/checkbox.jsx` so the label's `htmlFor` matches the rendered input's `id` when the caller does not pass an `id` prop.

The wrapper and the inner `inputs/checkbox.js` each run their own `useInput`, and each generates a random id when none is given. The wrapper passed only the caller's (absent) `id` down, so the input got the inner generated id while the label pointed at the outer one. Labels no longer toggled their checkbox and label-based test automation (e.g. Capybara `check`) could not resolve the input. The outer generated id is now passed to the inner `Checkbox`.
