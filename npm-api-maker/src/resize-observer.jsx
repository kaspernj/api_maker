import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerResizeObserver extends React.PureComponent {
  static propTypes = PropTypesExact({
    element: PropTypes.instanceOf(Element),
    onResize: PropTypes.func.isRequired
  })

  componentDidMount() {
    if (this.props.element) this.startObserve()
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.element && this.props.element) {
      this.startObserve()
    } else if (prevProps.element && !this.props.element) {
      this.endObserve()
    } else if (prevProps.element != this.props.element) {
      this.endObserve()
      this.startObserve()
    }
  }

  componentWillUnmount() {
    if (this.observer) this.endObserve()
  }

  startObserve() {
    this.observer = new ResizeObserver(this.props.onResize)
    this.observer.observe(this.props.element)
  }

  endObserve() {
    this.observer.disconnect()
    this.observer = null
  }

  render() {
    return null
  }
}
