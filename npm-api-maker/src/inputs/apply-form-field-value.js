// @ts-check

/**
 * Applies a Formmeld-owned value to an uncontrolled DOM or React Native field.
 *
 * @param {{
 *   applyFormFieldValue?: (value: unknown) => void,
 *   checked?: boolean,
 *   setNativeProps?: (props: object) => void,
 *   value?: unknown
 * }} input
 * @param {unknown} value
 * @param {{checkbox?: boolean}} [options]
 */
export default function applyFormFieldValue(input, value, options = {}) {
  if (input.applyFormFieldValue) {
    input.applyFormFieldValue(value)
    return
  }

  if (options.checkbox) {
    const checked = Boolean(value)

    if (input.setNativeProps) {
      input.setNativeProps({value: checked})
    } else {
      input.checked = checked
    }
  } else {
    const text = value === null || value === undefined ? "" : String(value)

    if (input.setNativeProps) {
      input.setNativeProps({text})
    } else {
      input.value = text
    }
  }
}
