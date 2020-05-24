const inflection = require("inflection")

export default function ApiMakerIdForComponent(component) {
  if (component.props.id) {
    return component.props.id
  } else if (component.props.model) {
    return `${component.props.model.modelClassData().paramKey}_${inflection.underscore(component.props.attribute)}`
  } else if (component.generatedInputId) {
    return component.generatedInputId
  } else {
    const generatedInputId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    component.generatedInputId = generatedInputId
    return generatedInputId
  }
}
