import {AttributeRows, Card} from "@kaspernj/api-maker-bootstrap"
import User from "api-maker/models/user"

export default class RouteBootstrapAttributeRows extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: undefined
    }
  }

  componentDidMount() {
    this.loadUsers()
  }

  async loadUsers() {
    const users = await User.ransack().toArray()

    this.setState({users})
  }

  render() {
    const {users} = this.state

    return (
      <Layout className="route-bootstrap-attribute-rows">
        {users && this.content()}
      </Layout>
    )
  }

  content() {
    const {users} = this.state

    return (
      <div className="content-container">
        <Card table>
          <tbody>
            {users.map((user) =>
              <tr className="user-row" data-user-id={user.id()} key={user.cacheKey()}>
                <td>{user.id()}</td>
                <td className="updated-at-column">
                  <table>
                    <tbody>
                      <AttributeRows
                        attributes={["updatedAt"]}
                        checkIfAttributeLoaded
                        model={user}
                      />
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </tbody>
        </Card>
      </div>
    )
  }
}
