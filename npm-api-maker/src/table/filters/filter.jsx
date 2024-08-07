import {Pressable, Text, View} from "react-native"
import BaseComponent from "../../base-component"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ApiMakerTableFilter extends BaseComponent {
  static defaultProps = {
    a: null,
    pre: null
  }

  static propTypes = PropTypesExact({
    a: PropTypes.string,
    filterIndex: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    onRemoveClicked: PropTypes.func.isRequired,
    p: PropTypes.array.isRequired,
    pre: PropTypes.string,
    sc: PropTypes.string,
    v: PropTypes.string.isRequired
  })

  render() {
    const {p, v} = this.p
    const {a, pre, sc} = this.props

    return (
      <View style={{display: "flex", flexDirection: "row", backgroundColor: "grey", paddingVertical: 10, paddingHorizontal: 6}}>
        <Pressable dataSet={{class: "filter-label"}} onPress={this.tt.onFilterPressed}>
          <Text>
            {p.length > 0 &&
              `${p.join(".")}.`
            }
            {a} {sc} {pre} {v}
          </Text>
        </Pressable>
        <Pressable dataSet={{class: "remove-filter-button"}} onPress={this.tt.onRemoveFilterPressed} style={{marginLeft: 6}}>
          <Text>
            &#10006;
          </Text>
        </Pressable>
      </View>
    )
  }

  onFilterPressed = (e) => {
    e.preventDefault()

    const {a, filterIndex, p, pre, v} = this.p

    this.props.onClick({a, filterIndex, p, pre, v})
  }

  onRemoveFilterPressed = (e) => {
    e.preventDefault()

    this.props.onRemoveClicked({filterIndex: this.p.filterIndex})
  }
}))
