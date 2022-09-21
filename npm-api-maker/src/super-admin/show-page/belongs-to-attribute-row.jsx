import AttributeRow from "../../bootstrap/attribute-row"
import {digs} from "diggerize"
import inflection from "inflection"
import Params from "../../params"
import React from "react"

export default class ApiMakerSuperAdminShowPageBelongsToAttributeRow extends React.PureComponent {
  render() {
    const {model, modelClass, reflection} = digs(this.props, "model", "modelClass", "reflection")
    const reflectionMethodName = inflection.camelize(reflection.name(), true)
    const subModel = model[reflectionMethodName]()

    return (
      <AttributeRow label={modelClass.humanAttributeName(inflection.camelize(reflection.name(), true))}>
        {model &&
          <Link to={Params.withParams({model: subModel.modelClassData().name, model_id: subModel.primaryKey()})}>
            {subModel && "name" in subModel && subModel.name()}
            {subModel && !("name" in subModel) && subModel?.id()}
          </Link>
        }
      </AttributeRow>
    )
  }
}
