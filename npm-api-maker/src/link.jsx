import {Platform, Pressable} from "react-native"
import React, {useRef} from "react"
import BaseComponent from "./base-component"
import dataSetToAttributes from "./data-set-to-attributes"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {useApiMaker} from "@kaspernj/api-maker/build/with-api-maker"

export default memo(shapeComponent(class ApiMakerLink extends BaseComponent {
  static propTypes = {
    usePressable: PropTypes.bool
  }

  setup() {
    this.apiMaker = useApiMaker()
    this.linkRef = useRef()
  }

  render() {
    const {dataSet, to, onClick, onPress, usePressable, ...restProps} = this.props

    if (Platform.OS == "web" && !usePressable) {
      return (
        <a {...dataSetToAttributes(dataSet)} href={to} {...restProps} onClick={this.tt.onLinkClicked} ref={this.tt.linkRef}  />
      )
    }

    return (
      <Pressable dataSet={dataSet} onPress={this.tt.onPress} {...restProps} />
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

    if (!e.defaultPrevented && !e.ctrlKey && !e.metaKey && this.tt.linkRef.current?.target != "_blank") {
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
    const history = this.apiMaker.config.getHistory()

    if (!history) throw new Error("History hasn't been set in the API maker configuration")

    history.push(this.props.to)
  }
}))
