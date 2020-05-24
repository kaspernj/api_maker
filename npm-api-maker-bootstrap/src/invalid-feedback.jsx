import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerBootstrapInvalidFeedback extends React.Component {
  static propTypes = PropTypesExact({
    errors: PropTypes.array.isRequired
  })

  render() {
    const { errors } = this.props

    return (
      <div className="invalid-feedback">
        {errors.map(error => error.getErrorMessage()).join(". ")}
      </div>
    )
  }
}
