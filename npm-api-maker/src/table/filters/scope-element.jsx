import BaseComponent from "../../base-component"
import PropTypes from "prop-types"
import {memo} from "react"
import {Pressable, Text} from "react-native"
import {shapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ScopeElement extends BaseComponent {
  static defaultProps = {
    active: false
  }

  static propTypes = {
    active: PropTypes.bool.isRequired,
    onScopeClicked: PropTypes.func.isRequired,
    scope: PropTypes.string.isRequired
  }

  render() {
    const {active, scope} = this.p
    const style = {}

    if (active) style.fontWeight = "bold"

    return (
      <Pressable
        dataSet={{class: "scope-element", scopeName: scope}}
        key={scope}
        onPress={this.tt.onScopeClicked}
      >
        <Text style={style}>
          {scope}
        </Text>
      </Pressable>
    )
  }

  onScopeClicked = (e) => {
    e.preventDefault()

    this.p.onScopeClicked({scope: this.p.scope})
  }
}))
