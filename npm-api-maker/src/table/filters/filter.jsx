import {Pressable, View} from "react-native"
import BaseComponent from "../../base-component.js"
import Icon from "../../utils/icon"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"

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
      <View style={this.cache("rootViewStyle", {alignItems: "center", flexDirection: "row", backgroundColor: "grey", paddingVertical: 10, paddingHorizontal: 6})}>
        <Pressable
          dataSet={{
            attribute: a,
            class: "filter-label",
            scope: sc
          }}
          onPress={this.tt.onFilterPressed}
        >
          <Text>
            {p.length > 0 &&
              `${p.join(".")}.`
            }
            {a} {sc} {pre} {v}
          </Text>
        </Pressable>
        <Pressable
          dataSet={this.cache("removeFilterButtonDataSet", {class: "remove-filter-button"})}
          onPress={this.tt.onRemoveFilterPressed}
          style={this.cache("removeFilterButtonStyle", {marginLeft: 6})}
        >
          <Icon name="remove" />
        </Pressable>
      </View>
    )
  }

  onFilterPressed = (e) => {
    e.preventDefault()

    const {a, filterIndex, p, pre, v} = this.p
    const {sc} = this.props

    this.props.onClick({a, filterIndex, p, pre, sc, v})
  }

  onRemoveFilterPressed = (e) => {
    e.preventDefault()

    this.props.onRemoveClicked({filterIndex: this.p.filterIndex})
  }
}))
