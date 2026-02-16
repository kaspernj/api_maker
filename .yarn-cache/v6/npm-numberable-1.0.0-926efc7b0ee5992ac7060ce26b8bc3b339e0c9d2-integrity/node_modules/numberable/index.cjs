module.exports = function numberable(number, {delimiter = ",", precision = 2, separator = "."}) {
  // Fixed number of decimals to given precision and convert to string
  number = `${number.toFixed(precision)}`

  // Split whole number with decimals
  const numberParts = number.split(".")
  const wholeNumbers = numberParts[0]

  let decimals = numberParts[1]

  // Append decimals if there are fewer then decired
  while(decimals.length < precision) {
    decimals += "0"
  }

  // Add delimiters to the whole number
  let numberWithDelimiters = ""
  let location = wholeNumbers.length

  while(location >= 1) {
    if (numberWithDelimiters != "") {
      numberWithDelimiters = `${delimiter}${numberWithDelimiters}`
    }

    numberWithDelimiters = `${wholeNumbers.substring(location - 3, location)}${numberWithDelimiters}`
    location -= 3
  }

  return `${numberWithDelimiters}${separator}${decimals}`
}
