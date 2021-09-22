const classNames = require("classnames")
const PropTypes = require("prop-types")
const React = require("react")

export default class ApiMakerBootstrapAttributeRow extends React.PureComponent {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    identifier: PropTypes.string,
    label: PropTypes.node,
    value: PropTypes.node
  }

  render() {
    const {attribute, children, className, identifier, label, value, ...restProps} = this.props

    return (
      <tr
        className={classNames(className, "component-api-maker-attribute-row")}
        data-attribute={attribute}
        data-identifier={identifier}
        {...restProps}
      >
        <th className="attribute-row-label">
          {label}
        </th>
        <td className="attribute-row-value">
          {value || children}
        </td>
      </tr>
    )
  }
}
