import BaseComponent from "../../base-component"
import {digg} from "diggerize"
import EditAttributeCheckbox from "./edit-attribute-checkbox"
import EditAttributeContent from "./edit-attribute-content"
import EditAttributeInput from "./edit-attribute-input"
import * as inflection from "inflection"
import Locales from "shared/locales"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import {View} from "react-native"
import {shapeComponent} from "set-state-compare/src/shape-component"

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
        dataSet={this.rootViewDataSet ||= {component: "api-maker/super-admin/edit-page/edit-attribute"}}
        style={this.cache("rootViewStyle", {marginBottom: attribute.translated ? undefined : 12}, [attribute.translated])}
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
                  <View key={locale} style={this.localeViewStyle ||= {marginBottom: 12}}>
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
