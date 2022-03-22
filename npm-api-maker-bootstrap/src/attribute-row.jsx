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

  render () {
    const {attribute, children, className, identifier, label, value, ...restProps} = this.props

    return (
      <div
        className={classNames(className, "component-api-maker-attribute-row")}
        data-attribute={attribute}
        data-identifier={identifier}
        {...restProps}
      >
        <div className="attribute-row-label">
          {label}
        </div>
        <div className="attribute-row-value">
          {value || children}
        </div>
      </div>
    )
  }
}
