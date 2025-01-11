export default function apiMakerTranslatedAttributes(attributeNames, availableLocales) {
  const translatedAttributes = []

  for (const attribute of attributeNames) {
    for (const locale of availableLocales) {
      translatedAttributes.push(`${attribute}${locale.substring(0, 1).toUpperCase()}${locale.substring(1, 99)}`)
    }
  }

  return translatedAttributes
}
