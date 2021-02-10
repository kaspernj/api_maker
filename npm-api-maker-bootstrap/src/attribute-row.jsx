const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerBootstrapAttributeRow extends React.Component {
  static propTypes = PropTypesExact({
    children: PropTypes.node,
    label: PropTypes.node,
    value: PropTypes.node
  })

  render() {
    return (
      <tr>
        <th>
          {this.props.label}
        </th>
        <td>
          {this.props.value || this.props.children}
        </td>
      </tr>
    )
  }
}
