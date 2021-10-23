const translatedCollectionsData = require("./translated-collections-data").default

export default class ApiMakerTranslatedCollections {
  static get(modelClass, collectionName) {
    const locale = I18n.locale
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const collection = digg(translatedCollectionsData, modelClassName, collectionName, locale, "collection_array")

    return collection
  }
}
