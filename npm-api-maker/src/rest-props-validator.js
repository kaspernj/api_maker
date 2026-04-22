// @ts-check
/**
 * @param {Record<string, object | string | number | boolean | null | undefined>} restProps
 * @returns {void}
 */
const restPropsValidator = (restProps) => {
  const restPropsKeys = Object.keys(restProps)

  if (restPropsKeys.length > 0) {
    throw new Error(`Invalid props: ${restPropsKeys.join(", ")}`)
  }
}

export default restPropsValidator
