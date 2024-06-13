import {digg} from "diggerize"
import PropTypes from "prop-types"
import {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ScopeElement extends ShapeComponent {
  static defaultProps = {
    active: false
  }

  static propTypes = {
    active: PropTypes.bool.isRequired,
    scope: PropTypes.object.isRequired
  }

  render() {
    const {active, scope} = this.props
    const style = {}

    if (active) style.fontWeight = "bold"

    return (
      <div
        className="scope-element"
        key={scope.name()}
        onClick={digg(this, "onScopeClicked")}
        style={style}
      >
        {scope.name()}
      </div>
    )
  }

  onScopeClicked = (e) => {
    e.preventDefault()

    this.props.onScopeClicked({scope: this.props.scope})
  }
}))
