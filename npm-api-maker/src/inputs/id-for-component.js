import * as inflection from "inflection"

/** Build deterministic input id for a component. */
export default function apiMakerIdForComponent(component) {
  if ("id" in component.props) {
    return component.props.id
  } else if (component.props.attribute && component.props.model) {
    return `${component.props.model.modelClassData().paramKey}_${inflection.underscore(component.props.attribute)}`
  } else if (component.generatedInputId) {
    return component.generatedInputId
  } else {
    const generatedInputId = Math.random()
      .toString(36)
      .substring(2, 15) + Math.random()
      .toString(36)
      .substring(2, 15)
    component.generatedInputId = generatedInputId
    return generatedInputId
  }
}
