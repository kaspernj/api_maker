/** Resolve a unique column identifier. */
export default function columnIdentifier(column) {
  if ("identifier" in column) return column.identifier

  const parts = []

  if ("path" in column) {
    for (const pathPart of column.path) {
      parts.push(pathPart)
    }
  }

  if ("attribute" in column) {
    parts.push(`attribute-${column.attribute}`)
  }

  if ("sortKey" in column) {
    parts.push(`sort-key-${column.sortKey}`)
  }

  if (parts.length == 0) throw new Error(`Couldn't figure out the identifier for that column: ${JSON.stringify(column)}`)

  return parts.join("--")
}
