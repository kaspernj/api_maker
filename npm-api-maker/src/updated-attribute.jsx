// @ts-check
/* eslint-disable sort-imports */
import {digg} from "diggerize"
import memo from "set-state-compare/build/memo.js"
import ModelEvents from "./model-events.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"

/**
 * @typedef {object} Props
 * @property {string} [attribute]
 * @property {object} model
 * @property {(args: {model: object}) => import("react").ReactNode} [onValue]
 */
/**
 * @typedef {object} State
 * @property {object} model
 * @property {import("react").ReactNode | undefined} value
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerUpdatedAttribute extends ShapeComponent {
  static propTypes = propTypesExact({
    attribute: PropTypes.string,
    model: PropTypes.object.isRequired,
    onValue: PropTypes.func
  })

  state = {
    model: this.props.model,
    value: undefined
  }

  componentDidMount() {
    this.setAttribute()
    this.connect()
  }

  componentWillUnmount() {
    // Apparently 'componentWillUnmount' can be called without 'componentDidMount' was called. Several bug reports on this.
    if (this.connectUpdated) {
      this.connectUpdated.unsubscribe()
    }
  }

  connect() {
    this.connectUpdated = ModelEvents.connectUpdated(this.props.model, (args) => {
      if (!this.props.attribute || args.model.isAttributeLoaded(this.props.attribute)) {
        this.s.model = args.model
        this.setAttribute()
      } else {
        this.loadModelWithAttribute()
      }
    })
  }

  // This loads the model from the backend with the primary key and the attribute and calls setAttribute
  async loadModelWithAttribute() {
    const id = this.props.model.primaryKey()
    const modelClass = this.props.model.modelClass()
    const modelName = digg(modelClass.modelClassData(), "name")
    const primaryKey = digg(modelClass.modelClassData(), "primaryKey")

    const args = {}
    args[`${primaryKey}_eq`] = id

    const select = {}
    select[modelName] = [primaryKey, this.props.attribute]

    const model = await modelClass
      .ransack(args)
      .select(select)
      .first()

    this.s.model = model
    this.setAttribute()
  }

  setAttribute() {
    let newValue

    if (this.props.onValue) {
      newValue = this.props.onValue.apply(null, [{model: this.s.model}])
    } else {
      if (!this.s.model[this.props.attribute]) {
        throw new Error(`No such method: ${digg(this.s.model.modelClassData(), "name")}#${this.props.attribute}()`)
      }

      newValue = this.s.model[this.props.attribute].apply(this.s.model)
    }

    this.s.value = newValue
  }

  render() {
    if (this.s.value === undefined) return null

    return this.s.value
  }
}))
