// @ts-check
import * as inflection from "inflection"

/** @typedef {{modelClassData: () => {paramKey: string}}} InputModelLike */
/** @typedef {{props: {attribute?: string, model?: InputModelLike, name?: string, type?: string}}} InputComponentLike */

/**
 * Build deterministic input name for a component.
 * @param {InputComponentLike} component
 * @returns {string | undefined}
 */
export default function apiMakerNameForComponent (component) {
  if ("name" in component.props) {
    return component.props.name
  } else if (component.props.attribute && component.props.model) {
    let attributeName = inflection.underscore(component.props.attribute)

    if (component.props.type == "money") {
      attributeName += "_cents"
    }

    return `${component.props.model.modelClassData().paramKey}[${attributeName}]`
  }
}
