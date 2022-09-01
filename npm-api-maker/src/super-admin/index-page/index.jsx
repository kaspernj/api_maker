import {digs} from "diggerize"
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
          columns={this.columns()}
          currentUser={currentUser}
          modelClass={modelClass}
        />
      </div>
    )
  }

  columns() {
    return [

    ]
  }
}
