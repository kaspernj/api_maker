class ParentElementsResult {
  constructor(element, path) {
    this.element = element
    this.path = path
  }

  getElement() {
    return this.element
  }

  getPath() {
    return this.path
  }
}

const parentElement = ({element, callback}) => {
  const results = parentElements({element, breakAfterFirstFound: true, callback})

  if (results.length > 0) {
    return results[0].getElement()
  }
}

const parentElements = ({element, breakAfterFirstFound, callback, currentPath = [], results = []}) => {
  const parent = element.parentNode
  const includeInResults = callback({element: parent})

  if (includeInResults) {
    const elementResult = new ParentElementsResult(parent, currentPath)

    results.push(elementResult)

    if (breakAfterFirstFound) return
  }

  if (!breakAfterFirstFound || results.length == 0) {
    parentElements({
      element: parent,
      currentPath: [...currentPath, parent],
      results
    })
  }

  return results
}

module.export = {
  parentElement,
  parentElements
}
