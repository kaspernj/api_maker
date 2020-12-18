import {digs} from "@kaspernj/object-digger"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerBootstrapInvalidFeedback extends React.Component {
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
