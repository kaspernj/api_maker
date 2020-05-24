import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

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
