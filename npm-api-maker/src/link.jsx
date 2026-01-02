import {Platform, Pressable} from "react-native"
import BaseComponent from "./base-component"
import dataSetToAttributes from "./data-set-to-attributes.js"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import {useApiMaker} from "@kaspernj/api-maker/build/with-api-maker.js"

export default memo(shapeComponent(class ApiMakerLink extends BaseComponent {
  static propTypes = {
    usePressable: PropTypes.bool
  }

  setup() {
    this.apiMaker = useApiMaker()
  }

  render() {
    const {dataSet, to, onClick, onPress, testID, usePressable, ...restProps} = this.props

    if (Platform.OS == "web" && !usePressable) {
      return (
        <a {...dataSetToAttributes(Object.assign({testid: testID}, dataSet))} href={to || "#"} {...restProps} onClick={this.tt.onLinkClicked} />
      )
    }

    return (
      <Pressable dataSet={dataSet} onPress={this.tt.onPress} testID={testID} {...restProps} />
    )
  }

  onLinkClicked = (e, ...restArgs) => {
    const {onClick, onPress} = this.props

    if (onClick) {
      onClick(e, ...restArgs)
    }

    if (onPress) {
      onPress(e, ...restArgs)
    }

    if (!e.defaultPrevented && !e.ctrlKey && !e.metaKey && this.props.target != "_blank") {
      e.preventDefault()

      this.redirect()
    }
  }

  onPress = () => {
    const {onClick, onPress} = this.props

    if (onClick) {
      onClick(e, ...restArgs)
    }

    if (onPress) {
      onPress(e, ...restArgs)
    }

    this.redirect()
  }

  redirect = () => {
    // If no timeout is used, this can cause an "component suspended while responding to synchronous input"-error
    setTimeout(() => { this._historyPush() }, 0)
  }

  _historyPush() {
    const history = this.apiMaker.config.getHistory()

    if (!history) throw new Error("History hasn't been set in the API maker configuration")

    history.push(this.props.to)
  }
}))
