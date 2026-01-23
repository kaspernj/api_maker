/* eslint-disable sort-imports */
import {Platform, Pressable} from "react-native"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import {useApiMaker} from "@kaspernj/api-maker/build/with-api-maker.js"
import BaseComponent from "./base-component"
import PropTypes from "prop-types"
import React from "react"
import dataSetToAttributes from "./data-set-to-attributes.js"
import memo from "set-state-compare/build/memo.js"

export default memo(shapeComponent(class ApiMakerLink extends BaseComponent {
  static propTypes = {
    paddingHorizontal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    paddingVertical: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    usePressable: PropTypes.bool
  }

  setup() {
    this.apiMaker = useApiMaker()
  }

  render() {
    const {dataSet, to, onClick, onPress, paddingHorizontal, paddingVertical, style, testID, usePressable, ...restProps} = this.props
    const linkStyle = this.linkStyle({paddingHorizontal, paddingVertical, style})

    if (Platform.OS == "web" && !usePressable) {
      return (
        <a
          {...dataSetToAttributes(Object.assign({testid: testID}, dataSet))} // eslint-disable-line prefer-object-spread
          href={to || "#"}
          onClick={this.tt.onLinkClicked}
          style={linkStyle}
          {...restProps}
        />
      )
    }

    return (
      <Pressable dataSet={dataSet} onPress={this.tt.onPress} style={linkStyle} testID={testID} {...restProps} />
    )
  }

  /** Returns a cached style object with padding props applied. */
  linkStyle({paddingHorizontal, paddingVertical, style}) {
    const stylePaddingHorizontal = style?.paddingHorizontal
    const stylePaddingVertical = style?.paddingVertical
    const paddingHorizontalDefined = paddingHorizontal !== null && paddingHorizontal !== undefined
    const paddingVerticalDefined = paddingVertical !== null && paddingVertical !== undefined
    const stylePaddingHorizontalDefined = stylePaddingHorizontal !== null && stylePaddingHorizontal !== undefined
    const stylePaddingVerticalDefined = stylePaddingVertical !== null && stylePaddingVertical !== undefined
    const hasPaddingHorizontal = paddingHorizontalDefined || stylePaddingHorizontalDefined
    const hasPaddingVertical = paddingVerticalDefined || stylePaddingVerticalDefined

    return this.cache("linkStyle", () => {
      if (hasPaddingHorizontal || hasPaddingVertical) {
        const styleObject = style || {}
        const resolvedPaddingHorizontal = paddingHorizontalDefined ? paddingHorizontal : stylePaddingHorizontal
        const resolvedPaddingVertical = paddingVerticalDefined ? paddingVertical : stylePaddingVertical
        const nextStyle = {...styleObject}

        delete nextStyle.paddingHorizontal
        delete nextStyle.paddingVertical

        if (resolvedPaddingHorizontal !== null && resolvedPaddingHorizontal !== undefined) {
          if (nextStyle.paddingLeft === null || nextStyle.paddingLeft === undefined) nextStyle.paddingLeft = resolvedPaddingHorizontal
          if (nextStyle.paddingRight === null || nextStyle.paddingRight === undefined) nextStyle.paddingRight = resolvedPaddingHorizontal
        }

        if (resolvedPaddingVertical !== null && resolvedPaddingVertical !== undefined) {
          if (nextStyle.paddingTop === null || nextStyle.paddingTop === undefined) nextStyle.paddingTop = resolvedPaddingVertical
          if (nextStyle.paddingBottom === null || nextStyle.paddingBottom === undefined) nextStyle.paddingBottom = resolvedPaddingVertical
        }

        return nextStyle
      }

      return style
    }, [hasPaddingHorizontal, hasPaddingVertical, paddingHorizontal, paddingVertical, style, stylePaddingHorizontal, stylePaddingVertical])
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
      onClick(e, ...restArgs) // eslint-disable-line no-undef
    }

    if (onPress) {
      onPress(e, ...restArgs) // eslint-disable-line no-undef
    }

    this.redirect()
  }

  redirect = () => {
    // If no timeout is used, this can cause an "component suspended while responding to synchronous input"-error
    setTimeout(() => {
      this._historyPush()
    }, 0)
  }

  _historyPush() {
    const history = this.apiMaker.config.getHistory()

    if (!history) throw new Error("History hasn't been set in the API maker configuration")

    history.push(this.props.to)
  }
}))
