import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"

export default class ApiMakerBootstrapInvalidFeedback extends React.Component {
  static propTypes = PropTypesExact({
    errors: PropTypes.array.isRequired
  })

  render() {
    const { errors } = this.props

    console.log({ errors })

    return (
      <div className="invalid-feedback">
        {errors.map(error => error.getErrorMessage()).join(". ")}
      </div>
    )
  }
}
