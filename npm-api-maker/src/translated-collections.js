import {digg} from "diggerize"
import I18nOnSteroids from "i18n-on-steroids"
import translatedCollectionsData from "../src/translated-collections-data.js.erb"

export default class ApiMakerTranslatedCollections {
  static get (modelClass, collectionName) {
    const locale = I18nOnSteroids.getCurrent().locale
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const collection = digg(translatedCollectionsData, modelClassName, collectionName, locale, "collection_array")

    return collection
  }
}
