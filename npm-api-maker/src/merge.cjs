const isPlainObject = (input) => {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return true
  }

  return false
}

const merge = (firstObject, ...objects) => {
  for (const object of objects) {
    mergeObjectsInto(firstObject, object)
  }

  return firstObject
}

const mergeArraysInto = (mergeIntoValue, ...arrays) => {
  for (const array of arrays) {
    for (const value of array) {
      if (!mergeIntoValue.includes(value)) {
        mergeIntoValue.push(value)
      }
    }
  }
}

const mergeObjectsInto = (mergeInto, object) => {
  for (const key in object) {
    const value = object[key]

    if (key in mergeInto) {
      const mergeIntoValue = mergeInto[key]

      if (Array.isArray(value)) {
        // Current value isn't an array - turn into array and then merge into that
        if (!Array.isArray(mergeIntoValue)) {
          mergeInto[key] = [mergeIntoValue]
        }

        mergeArraysInto(mergeInto[key], value)
      } else if (isPlainObject(mergeIntoValue) && isPlainObject(value)) {
        mergeObjectsInto(mergeIntoValue, value)
      } else {
        mergeInto[key] = value
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
