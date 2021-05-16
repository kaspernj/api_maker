const {digs} = require("@kaspernj/object-digger")
const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerBootstrapInvalidFeedback extends React.Component {
  static propTypes = PropTypesExact({
    className: PropTypes.string,
    errors: PropTypes.array.isRequired
  })

  render() {
    const {className} = this.props

    return (
      <div className={classNames("invalid-feedback", className)}>
        {this.errorMessages().join(". ")}
      </div>
    )
  }

  errorMessages() {
    const {errors} = digs(this.props, "errors")
    const errorMessages = []

    for (const error of errors) {
      for (const errorMessage of error.getErrorMessages()) {
        errorMessages.push(errorMessage)
      }
    }

    return errorMessages
  }
}
