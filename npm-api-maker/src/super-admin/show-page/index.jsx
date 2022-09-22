import AttributeRows from "../../bootstrap/attribute-rows"
import BelongsToAttributeRow from "./belongs-to-attribute-row"
import ConfigReader from "../config-reader"
import {digg, digs} from "diggerize"
import modelLoadWrapper from "../../model-load-wrapper"
import PropTypes from "prop-types"
import React from "react"
import ShowNav from "../show-nav"

class ApiMakerSuperAdminShowPage extends React.PureComponent {
  static propTypes = {
    modelClass: PropTypes.func.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  render() {
    const {modelClass, queryParams} = digs(this.props, "modelClass", "queryParams")
    const attributes = this.attributes()
    const model = this.model()

    return (
      <div className="super-admin--show-page">
        {model &&
          <ShowNav model={model} modelClass={modelClass} queryParams={queryParams} />
        }
        {attributes && model &&
          <AttributeRows attributes={attributes} model={model} />
        }
        {model && modelClass.reflections().filter((reflection) => reflection.macro() == "belongs_to").map((reflection) =>
          <BelongsToAttributeRow key={reflection.name()} model={model} modelClass={modelClass} reflection={reflection} />
        )}
      </div>
    )
  }

  attributes() {
    const {modelClass} = digs(this.props, "modelClass")
    const configReader = ConfigReader.forModel(modelClass)

    return configReader.attributesToShow()
  }

  model() {
    const {modelClass} = digs(this.props, "modelClass")
    const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")

    return digg(this, "props", camelizedLower)
  }
}

const modelClassResolver = {callback: ({queryParams}) => {
  const modelClassName = digg(queryParams, "model")
  const modelClass = digg(require("../../models.mjs.erb"), modelClassName)

  return modelClass
}}

export default modelLoadWrapper(
  ApiMakerSuperAdminShowPage,
  modelClassResolver,
  ({modelClass}) => {
    const preload = []
    const select = {}

    for (const reflection of modelClass.reflections()) {
      if (reflection.macro() != "belongs_to") continue

      const reflectionModelClass = reflection.modelClass()
      const reflectionModelClassName = reflectionModelClass.modelClassData().name
      const reflectionModelClassAttributes = reflectionModelClass.attributes()
      const nameAttribute = reflectionModelClassAttributes.find((attribute) => attribute.name() == "name")

      preload.push(inflection.underscore(reflection.name()))

      if (!(reflectionModelClassName in select)) select[reflectionModelClassName] = []
      if (!select[reflectionModelClassName].includes("id")) select[reflectionModelClassName].push("id")
      if (nameAttribute && !select[reflectionModelClassName].includes("name")) select[reflectionModelClassName].push("name")
    }

    return {
      loadByQueryParam: ({props}) => props.queryParams.model_id,
      preload,
      select
    }
  }
)
