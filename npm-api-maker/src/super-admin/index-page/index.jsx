import {digg, digs} from "diggerize"
import Params from "../../params"
import Table from "../../table/table"

export default class ApiMakerSuperAdminIndexPage extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    queryParams: PropTypes.object.isRequired
  }

  render() {
    const {currentUser, modelClass} = digs(this.props, "currentUser", "modelClass")

    return (
      <div>
        <Table
          columns={digg(this, "columns")}
          currentUser={currentUser}
          modelClass={modelClass}
          viewModelPath={digg(this, "viewModelPath")}
        />
      </div>
    )
  }

  columns = () => {
    return [

    ]
  }

  viewModelPath = (args) => {
    const argName = digg(this.props.modelClass.modelClassData(), "camelizedLower")
    const model = digg(args, argName)

    console.log({args, model})

    return Params.withParams({
      model: this.props.modelClass.modelClassData().name,
      model_id: model.primaryKey()
    })
  }
}
