// @ts-check
/**
 * Compose wrapper HOCs right-to-left.
 * @template TComponent
 * @param {TComponent} wrappedComponentClass
 * @param {...((componentClass: TComponent) => TComponent)} funcs
 * @returns {TComponent}
 */
export default function apiMakerCompose(wrappedComponentClass, ...funcs) {
  if (!wrappedComponentClass) throw new Error("No 'wrappedComponentClass' given")

  let currentComponentClass = wrappedComponentClass

  for (const func of funcs) {
    currentComponentClass = func(currentComponentClass)
  }

  return currentComponentClass
}
