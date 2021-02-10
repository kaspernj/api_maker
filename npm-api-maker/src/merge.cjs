function isPlainObject(input) {
  return input && typeof input === "object" && !Array.isArray(input)
}

function merge(...objects) {
  const newObject = {}

  for (const object of objects) {
    mergeObjectsInto(newObject, object)
  }

  return newObject
}

function mergeArraysInto(mergeIntoValue, ...arrays) {
  for (const array of arrays) {
    for (const value of array) {
      mergeIntoValue.push(value)
    }
  }
}

function mergeObjectsInto(mergeInto, object) {
  for (const key in object) {
    const value = object[key]

    if (key in mergeInto) {
      const mergeIntoValue = mergeInto[key]

      if (Array.isArray(mergeIntoValue)) {
        mergeArraysInto(mergeIntoValue, value)
      } else if (isPlainObject) {
        mergeObjectsInto(mergeIntoValue, value)
      } else {
        mergeInto = value
      }
    } else {
      mergeInto[key] = value
    }
  }
}

module.exports = {
  merge,
  mergeArraysInto,
  mergeObjectsInto
}
