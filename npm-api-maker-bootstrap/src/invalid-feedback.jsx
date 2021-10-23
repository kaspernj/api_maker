const {digs} = require("diggerize")
const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerBootstrapInvalidFeedback extends React.PureComponent {
  static propTypes = PropTypesExact({
    errors: PropTypes.array.isRequired
  })

  render() {
    return (
      <div className="invalid-feedback">
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
