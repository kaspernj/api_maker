/**
 * @param {object} args
 * @param {Array<any> | undefined} args.models
 * @param {object | undefined} args.query
 * @param {object | undefined} args.result
 * @param {boolean} args.showNoRecordsAvailableContent
 * @param {boolean} args.showNoRecordsFoundContent
 * @returns {boolean}
 */
export default function shouldRenderLoadingContent({
  models,
  query,
  result,
  showNoRecordsAvailableContent,
  showNoRecordsFoundContent
}) {
  if (showNoRecordsAvailableContent || showNoRecordsFoundContent) return false

  return !(query && result && models)
}
