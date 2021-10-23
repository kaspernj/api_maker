const translatedCollectionsData = require("./translated-collections-data").default

console.log({ translatedCollectionsData })

export default class ApiMakerTranslatedCollections {
  get(modelClass, collectionName) {
    console.log({ modelClass, collectionName })

    throw new Error("stub")
  }
}
