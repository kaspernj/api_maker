import BaseComponent from "../../base-component.js"
import {digg} from "diggerize"
import EditAttributeCheckbox from "./edit-attribute-checkbox.js"
import EditAttributeContent from "./edit-attribute-content.js"
import EditAttributeInput from "./edit-attribute-input.js"
import * as inflection from "inflection"
import Locales from "shared/locales.js"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import {View} from "react-native"
import {shapeComponent} from "set-state-compare/build/shape-component.js"

export default memo(shapeComponent(class EditAttribute extends BaseComponent {
  static propTypes = propTypesExact({
    attribute: PropTypes.object.isRequired,
    model: PropTypes.object,
    modelClass: PropTypes.func
  })

  render() {
    const {attribute, model, modelClass} = this.props
    const availableLocales = Locales.availableLocales()
    const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")
    const modelAttribute = modelClass.attributes().find((modelAttributeI) => modelAttributeI.name() == attribute.attribute)

    return (
      <View
        style={this.cache("rootViewStyle", {marginBottom: attribute.translated ? undefined : 12}, [attribute.translated])}
        testID="api-maker/super-admin/edit-page/edit-attribute"
      >
        {(() => {
          if (attribute.content) {
            return (
              <EditAttributeContent
                attribute={attribute}
                id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}`}
                model={model}
                name={inflection.underscore(attribute.attribute)}
              />
            )
          } else if (attribute.translated) {
            return (
              <>
                {availableLocales.map((locale) =>
                  <View key={locale} style={this.cache("localeViewStyle", {marginBottom: 12})}>
                    <EditAttributeInput
                      attributeName={`${attribute.attribute}${inflection.camelize(locale)}`}
                      id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}_${locale}`}
                      label={`${modelClass.humanAttributeName(attribute.attribute)} (${locale})`}
                      model={model}
                      name={`${inflection.underscore(attribute.attribute)}_${locale}`}
                    />
                  </View>
                )}
              </>
            )
          } else if (modelAttribute?.getColumn()?.getType() == "boolean") {
            return (
              <EditAttributeCheckbox
                attributeName={attribute.attribute}
                id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}`}
                label={modelClass.humanAttributeName(attribute.attribute)}
                model={model}
                name={inflection.underscore(attribute.attribute)}
              />
            )
          } else {
            return (
              <EditAttributeInput
                attributeName={attribute.attribute}
                id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}`}
                label={modelClass.humanAttributeName(attribute.attribute)}
                model={model}
                name={inflection.underscore(attribute.attribute)}
              />
            )
          }
        })()}
      </View>
    )
  }
}))
