/**
 * @param {Record<string, any>} restProps
 * @returns {void}
 */
const restPropsValidator = (restProps) => {
  const restPropsKeys = Object.keys(restProps)

  if (restPropsKeys.length > 0) {
    throw new Error(`Invalid props: ${restPropsKeys.join(", ")}`)
  }
}

export default restPropsValidator
