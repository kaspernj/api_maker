export default function columnIdentifier(column) {
  if ("identifier" in column) return column.identifier

  const parts = []

  if ("path" in column) {
    for (pathPart of column) {
      parts.push(column.name)
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
