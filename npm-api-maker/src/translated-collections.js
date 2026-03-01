/* eslint-disable import/no-unresolved, sort-imports */
import {digg} from "diggerize"
import I18nOnSteroids from "i18n-on-steroids"

// @ts-expect-error
import translatedCollectionsData from "translated-collections-data.json"

/** Translated collections helper. */
export default class ApiMakerTranslatedCollections {
  /**
   * @param {typeof import("./base-model.js").default} modelClass
   * @param {string} collectionName
   * @returns {Array<any> | undefined}
   */
  static get (modelClass, collectionName) {
    const locale = I18nOnSteroids.getCurrent().locale
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const collection = digg(translatedCollectionsData, modelClassName, collectionName, locale, "collection_array")

    return collection
  }
}
