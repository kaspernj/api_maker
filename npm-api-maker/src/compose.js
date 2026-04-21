// @ts-check
/**
 * Compose wrapper HOCs right-to-left.
 * @param {any} wrappedComponentClass
 * @param {...any} funcs
 * @returns {any}
 */
export default function apiMakerCompose(wrappedComponentClass, ...funcs) {
  if (!wrappedComponentClass) throw new Error("No 'wrappedComponentClass' given")

  let currentComponentClass = wrappedComponentClass

  for (const func of funcs) {
    currentComponentClass = func(currentComponentClass)
  }

  return currentComponentClass
}
