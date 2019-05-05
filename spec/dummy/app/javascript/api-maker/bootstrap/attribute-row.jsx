import React from "react"

export default class BootstrapAttributeRow extends React.Component {
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
