import BaseComponent from "../../base-component"
import {digg} from "diggerize"
import PropTypes from "prop-types"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ScopeElement extends BaseComponent {
  static defaultProps = {
    active: false
  }

  static propTypes = {
    active: PropTypes.bool.isRequired,
    onScopeClicked: PropTypes.func.isRequired,
    scope: PropTypes.object.isRequired
  }

  render() {
    const {active, scope} = this.p
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

    this.p.onScopeClicked({scope: this.p.scope})
  }
}))
