import {digs} from "diggerize"
import Link from "../link"
import React from "react"

export default class ApiMakerSuperAdminShowNav extends React.PureComponent {
  static propTypes = {
    model: PropTypes.object.isRequired,
    modelClass: PropTypes.func.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  render() {
    const {model, modelClass, queryParams} = digs(this.props, "model", "modelClass", "queryParams")
    const reflections = modelClass.reflections()

    return (
      <div>
        <div>
          <Link to={Params.withParams({model: modelClass.modelClassData().name, model_id: queryParams.model_id})}>
            {I18n.t("js.api_maker.suprt_admin.show_reflection_page.general", {defaultValue: "General"})}
          </Link>
        </div>
        {model && reflections.filter((reflection) => reflection.macro() == "has_many").map((reflection) =>
          <div key={reflection.name()}>
            <Link to={Params.withParams({model: digg(modelClass.modelClassData(), "name"), model_id: model.primaryKey(), model_reflection: reflection.name()})}>
              {modelClass.humanAttributeName(reflection.name())}
            </Link>
          </div>
        )}
      </div>
    )
  }
}
