// @ts-check
/**
 * @param {object} args
 * @param {object[] | undefined} args.models
 * @param {object | undefined} args.query
 * @param {object | undefined} args.result
 * @returns {boolean}
 */
export default function shouldRenderLoadingContent({
  models,
  query,
  result
}) {
  return !(query && result && models)
}
