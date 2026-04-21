// @ts-check
import * as inflection from "inflection"

/**
 * Build deterministic input name for a component.
 * @param {any} component
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
