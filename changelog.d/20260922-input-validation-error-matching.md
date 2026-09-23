Restored custom validation-error matching for inputs.

`use-input.js` now honors the `onMatchValidationError` prop: when a consumer passes it, it fully overrides the default matching of validation errors to the input (the default still matches on the input name). Previously the prop was declared on the input components but ignored, which broke consumers that render form fields whose names differ from the server-generated `input_name` of a validation error, such as nested-attributes forms where the error lands on a parent association. Unmatched validation errors stay unhandled and suppress the generic "validation errors" flash in consuming apps.

`use-input.js` also calls the `onErrors` prop with the matched validation errors whenever they change, restoring the callback contract from `@kaspernj/api-maker-inputs` that consumers use to render their own invalid feedback.
