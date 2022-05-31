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

  return parts.join("--")
}
